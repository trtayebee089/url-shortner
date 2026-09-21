<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_receives_token(): void
    {
        Notification::fake();
        $response = $this->postJson('/api/v1/auth/register', ['name' => 'Ada', 'email' => 'ada@example.com', 'password' => 'SecurePass!123', 'password_confirmation' => 'SecurePass!123']);
        $response->assertCreated()->assertJsonPath('data.user.email', 'ada@example.com')->assertJsonStructure(['data' => ['token']]);
        $user = User::where('email', 'ada@example.com')->firstOrFail();
        $this->assertNull($user->email_verified_at);
        Notification::assertSentTo($user, VerifyEmail::class);
        $this->withToken($response->json('data.token'))->getJson('/api/v1/links')->assertForbidden();
        $this->assertNotNull($user->tokens()->first()->expires_at);
    }

    public function test_user_can_login_and_invalid_credentials_are_rejected(): void
    {
        User::factory()->create(['email' => 'user@example.com', 'password' => Hash::make('SecurePass!123')]);
        $this->postJson('/api/v1/auth/login', ['email' => 'user@example.com', 'password' => 'SecurePass!123'])->assertOk()->assertJsonStructure(['data' => ['token']]);
        $this->postJson('/api/v1/auth/login', ['email' => 'user@example.com', 'password' => 'wrong'])->assertUnprocessable();
    }

    public function test_inactive_user_cannot_login(): void
    {
        User::factory()->create(['email' => 'blocked@example.com', 'password' => Hash::make('SecurePass!123'), 'status' => 'disabled']);
        $this->postJson('/api/v1/auth/login', ['email' => 'blocked@example.com', 'password' => 'SecurePass!123'])->assertUnprocessable();
    }

    public function test_existing_token_cannot_bypass_disabled_account(): void
    {
        $user = User::factory()->create(['email_verified_at' => now(), 'status' => 'disabled']);
        Sanctum::actingAs($user, ['*']);
        $this->getJson('/api/v1/links')->assertForbidden();
        $this->getJson('/api/v1/auth/me')->assertOk();
        $this->postJson('/api/v1/auth/logout')->assertOk();
    }

    public function test_signed_email_verification_link_marks_account_verified(): void
    {
        $user = User::factory()->unverified()->create();
        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(30), ['id' => $user->id, 'hash' => sha1($user->email)]);

        $this->get($url)->assertRedirect();
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_password_reset_request_is_neutral_for_unknown_accounts(): void
    {
        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'missing@example.com'])
            ->assertOk()
            ->assertJsonPath('message', 'If that email exists, a reset link has been sent.');
    }

    public function test_password_reset_changes_password_and_revokes_existing_tokens(): void
    {
        $user = User::factory()->create(['email' => 'reset@example.com']);
        $user->createToken('existing-session', ['*']);
        $token = Password::createToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'NewSecurePass!123',
            'password_confirmation' => 'NewSecurePass!123',
        ])->assertOk();

        $this->assertTrue(Hash::check('NewSecurePass!123', $user->fresh()->password));
        $this->assertSame(0, $user->tokens()->count());
    }
}
