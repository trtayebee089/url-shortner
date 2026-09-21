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
        ])->assertTooManyRequests();
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
        $this->postJson('/api/v1/abuse-reports', $payload)->assertTooManyRequests();
    }
}
