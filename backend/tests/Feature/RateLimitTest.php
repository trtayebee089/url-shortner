<?php

namespace Tests\Feature;

use App\Models\Link;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RateLimitTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_rate_limit_is_applied_to_the_route(): void
    {
        config()->set('shortener.rate_limits.auth', 2);
        User::factory()->create([
            'email' => 'limited@example.com',
            'password' => Hash::make('SecurePass!123'),
        ]);

        foreach (range(1, 2) as $_) {
            $this->postJson('/api/v1/auth/login', [
                'email' => 'limited@example.com',
                'password' => 'incorrect',
            ])->assertUnprocessable();
        }

        $this->postJson('/api/v1/auth/login', [
            'email' => 'limited@example.com',
            'password' => 'incorrect',
        ])->assertTooManyRequests()->assertHeader('Retry-After');
    }

    public function test_registration_and_password_reset_rate_limits_are_applied(): void
    {
        config()->set('shortener.rate_limits.auth', 1);
        $registration = [
            'name' => 'Limited User',
            'email' => 'register-limited@example.com',
            'password' => 'SecurePass!123',
            'password_confirmation' => 'SecurePass!123',
        ];
        $this->postJson('/api/v1/auth/register', $registration)->assertCreated();
        $this->postJson('/api/v1/auth/register', $registration)->assertTooManyRequests()->assertHeader('Retry-After');

        config()->set('shortener.rate_limits.password_reset', 1);
        $payload = ['email' => 'reset-limited@example.com'];
        $this->postJson('/api/v1/auth/forgot-password', $payload)->assertOk();
        $this->postJson('/api/v1/auth/forgot-password', $payload)->assertTooManyRequests()->assertHeader('Retry-After');
    }

    public function test_authenticated_creation_and_global_api_rate_limits_are_applied(): void
    {
        config()->set('shortener.rate_limits.authenticated_create', 1);
        $user = User::factory()->create(['email_verified_at' => now()]);
        Sanctum::actingAs($user, ['*']);
        $this->postJson('/api/v1/links', ['destination_url' => 'https://example.com/one'])->assertCreated();
        $this->postJson('/api/v1/links', ['destination_url' => 'https://example.com/two'])->assertTooManyRequests()->assertHeader('Retry-After');

        $this->app['auth']->forgetGuards();
        config()->set('shortener.rate_limits.api', 1);
        $apiUser = User::factory()->create(['email_verified_at' => now()]);
        Sanctum::actingAs($apiUser, ['*']);
        $this->getJson('/api/v1/links')->assertOk();
        $this->getJson('/api/v1/links')->assertTooManyRequests()->assertHeader('Retry-After');
    }

    public function test_analytics_rate_limit_is_applied_per_authenticated_user(): void
    {
        config()->set('shortener.rate_limits.analytics', 2);
        $user = User::factory()->create();
        $link = Link::factory()->for($user)->create();
        Sanctum::actingAs($user, ['*']);

        $this->getJson("/api/v1/links/{$link->id}/analytics")->assertOk();
        $this->getJson("/api/v1/links/{$link->id}/analytics")->assertOk();
        $this->getJson("/api/v1/links/{$link->id}/analytics")->assertTooManyRequests();
    }

    public function test_abuse_report_rate_limit_is_applied_per_ip(): void
    {
        config()->set('shortener.rate_limits.abuse_reports', 2);
        $payload = ['short_code' => 'missing', 'reason' => 'spam'];

        $this->postJson('/api/v1/abuse-reports', $payload)->assertCreated();
        $this->postJson('/api/v1/abuse-reports', $payload)->assertCreated();
        $this->postJson('/api/v1/abuse-reports', $payload)->assertTooManyRequests()->assertHeader('Retry-After');
    }
}
