<?php

namespace Tests\Feature;

use App\Models\Link;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_ordinary_users_cannot_access_admin_endpoints(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $link = Link::factory()->create();
        Sanctum::actingAs($user, ['*']);

        foreach (['/api/v1/admin/stats', '/api/v1/admin/users', '/api/v1/admin/links', '/api/v1/admin/abuse-reports'] as $endpoint) {
            $this->getJson($endpoint)->assertForbidden();
        }
        $this->postJson("/api/v1/admin/links/{$link->id}/disable")->assertForbidden();
    }

    public function test_admin_disable_is_server_authorized_and_invalidates_cache(): void
    {
        $admin = User::factory()->create(['email_verified_at' => now(), 'role' => 'admin']);
        $link = Link::factory()->create(['short_code' => 'Moderate1', 'is_active' => true]);
        Cache::put('short-link:Moderate1', ['id' => $link->id, 'destination_url' => $link->destination_url, 'is_active' => true, 'expires_at' => null], 600);
        Sanctum::actingAs($admin, ['*']);

        $this->postJson("/api/v1/admin/links/{$link->id}/disable")->assertOk();
        $this->assertFalse($link->fresh()->is_active);
        $this->assertFalse(Cache::has('short-link:Moderate1'));
        $this->get('/Moderate1')->assertGone();
    }

    public function test_scoped_tokens_cannot_escalate_to_account_or_admin_actions(): void
    {
        $admin = User::factory()->create(['email_verified_at' => now(), 'role' => 'admin']);
        Sanctum::actingAs($admin, ['links:read', 'links:write', 'analytics:read']);

        $this->patchJson('/api/v1/profile', ['name' => 'Escalated', 'email' => $admin->email])->assertForbidden();
        $this->postJson('/api/v1/api-tokens', ['name' => 'Escalated'])->assertForbidden();
        $this->getJson('/api/v1/admin/stats')->assertForbidden();
    }
}
