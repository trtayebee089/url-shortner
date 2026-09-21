<?php

namespace Tests\Feature;

use App\Models\AbuseReport;
use App\Models\Link;
use App\Models\LinkDailyStat;
use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiSurfaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_validation_and_verification_resend_contracts(): void
    {
        Notification::fake();
        User::factory()->create(['email' => 'existing@example.com']);

        $this->postJson('/api/v1/auth/register', [
            'name' => 'Duplicate',
            'email' => 'existing@example.com',
            'password' => 'weak',
            'password_confirmation' => 'weak',
        ])->assertUnprocessable()->assertJsonValidationErrors(['email', 'password']);

        $user = User::factory()->unverified()->create();
        Sanctum::actingAs($user, ['*']);

        $this->postJson('/api/v1/auth/email/verification-notification')->assertOk();
        Notification::assertSentTo($user, VerifyEmail::class);
        $this->getJson('/api/v1/dashboard')->assertForbidden();
    }

    public function test_dashboard_only_aggregates_the_authenticated_users_links(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $owned = Link::factory()->for($user)->create(['clicks_count' => 11]);
        LinkDailyStat::create(['link_id' => $owned->id, 'stat_date' => today(), 'clicks' => 4, 'unique_clicks' => 3]);

        $other = User::factory()->create(['email_verified_at' => now()]);
        $foreign = Link::factory()->for($other)->create(['clicks_count' => 999]);
        LinkDailyStat::create(['link_id' => $foreign->id, 'stat_date' => today(), 'clicks' => 999, 'unique_clicks' => 999]);

        Sanctum::actingAs($user, ['*']);
        $this->getJson('/api/v1/dashboard')
            ->assertOk()
            ->assertJsonPath('data.total_links', 1)
            ->assertJsonPath('data.total_clicks', 11)
            ->assertJsonPath('data.unique_visitors', 3)
            ->assertJsonPath('data.clicks_today', 4);
    }

    public function test_profile_email_change_requires_reverification_and_password_change_revokes_other_tokens(): void
    {
        Notification::fake();
        $user = User::factory()->create([
            'email' => 'profile@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('OldSecurePass!123'),
        ]);
        $current = $user->createToken('current', ['*']);
        $other = $user->createToken('other', ['*']);

        $this->withToken($current->plainTextToken)->patchJson('/api/v1/profile', [
            'name' => 'Updated User',
            'email' => 'updated@example.com',
        ])->assertOk()->assertJsonPath('data.email', 'updated@example.com');

        $this->assertNull($user->fresh()->email_verified_at);
        Notification::assertSentTo($user, VerifyEmail::class);

        $user->fresh()->forceFill(['email_verified_at' => now()])->save();
        $this->app['auth']->forgetGuards();
        $this->withToken($current->plainTextToken)->putJson('/api/v1/profile/password', [
            'current_password' => 'OldSecurePass!123',
            'password' => 'NewSecurePass!456',
            'password_confirmation' => 'NewSecurePass!456',
        ])->assertOk();

        $this->assertTrue(Hash::check('NewSecurePass!456', $user->fresh()->password));
        $this->assertDatabaseHas('personal_access_tokens', ['id' => $current->accessToken->id]);
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $other->accessToken->id]);
    }

    public function test_api_tokens_are_listed_without_secrets_and_cannot_be_revoked_cross_user(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        Sanctum::actingAs($user, ['*']);

        $created = $this->postJson('/api/v1/api-tokens', ['name' => 'Automation', 'expires_in_days' => 30])
            ->assertCreated()
            ->assertJsonStructure(['data' => ['token', 'expires_at']]);
        $this->assertNotEmpty($created->json('data.token'));

        $tokenId = $user->tokens()->where('name', 'Automation')->value('id');
        $this->getJson('/api/v1/api-tokens')
            ->assertOk()
            ->assertJsonPath('data.0.id', $tokenId)
            ->assertJsonMissingPath('data.0.token');

        $foreignUser = User::factory()->create(['email_verified_at' => now()]);
        $foreignToken = $foreignUser->createToken('Foreign', ['*'])->accessToken;
        $this->deleteJson("/api/v1/api-tokens/{$foreignToken->id}")->assertNotFound();
        $this->assertDatabaseHas('personal_access_tokens', ['id' => $foreignToken->id]);

        $this->deleteJson("/api/v1/api-tokens/{$tokenId}")->assertOk();
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $tokenId]);
    }

    public function test_abuse_reporting_and_admin_read_endpoints_follow_the_documented_schema(): void
    {
        $link = Link::factory()->create(['short_code' => 'ReportMe']);
        $this->postJson('/api/v1/abuse-reports', [
            'short_code' => 'ReportMe',
            'reporter_email' => 'reporter@example.com',
            'reason' => 'phishing',
            'details' => 'Suspicious form.',
        ])->assertCreated()->assertJsonPath('data', null);
        $this->assertDatabaseHas('abuse_reports', ['link_id' => $link->id, 'reason' => 'phishing']);

        $this->postJson('/api/v1/abuse-reports', ['short_code' => 'ReportMe', 'reason' => 'invalid'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('reason');

        $admin = User::factory()->create(['email_verified_at' => now(), 'role' => 'admin']);
        Sanctum::actingAs($admin, ['*']);
        $this->getJson('/api/v1/admin/stats')->assertOk()->assertJsonStructure(['data' => ['users', 'links', 'clicks', 'open_reports']]);
        $this->getJson('/api/v1/admin/users')->assertOk()->assertJsonMissing(['password' => $admin->password]);
        $this->getJson('/api/v1/admin/links')->assertOk();
        $this->getJson('/api/v1/admin/abuse-reports')->assertOk()->assertJsonPath('data.data.0.id', AbuseReport::firstOrFail()->id);
    }
}
