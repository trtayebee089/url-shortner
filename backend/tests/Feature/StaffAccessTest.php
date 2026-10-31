<?php

namespace Tests\Feature;

use App\Models\StaffRole;
use App\Models\User;
use App\Services\RolePermissions;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StaffAccessTest extends TestCase
{
    use RefreshDatabase;

    private function asRole(string $role): User
    {
        $user = User::factory()->create(['role' => $role]);
        Sanctum::actingAs($user, ['*']);

        return $user;
    }

    public function test_only_superadmin_can_manage_staff_and_role_definitions(): void
    {
        config()->set('shortener.rate_limits.auth', 100);
        foreach (['user', 'admin', 'manager', 'billing', 'support', 'viewer'] as $role) {
            $this->asRole($role);
            $this->getJson('/api/v1/management/staff')->assertForbidden();
            $this->getJson('/api/v1/management/roles')->assertForbidden();
            $this->postJson('/api/v1/management/roles', [])->assertForbidden();
            $this->postJson('/api/v1/management/staff', [])->assertForbidden();
        }
        $this->asRole('superadmin');
        $this->getJson('/api/v1/management/staff')->assertOk();
        $this->getJson('/api/v1/management/roles')->assertOk()->assertJsonCount(7, 'data.roles');
        Sanctum::actingAs(User::factory()->create(['role' => 'superadmin']), ['links:read']);
        $this->getJson('/api/v1/management/staff')->assertForbidden();
    }

    public function test_assigning_or_removing_staff_access_revokes_tokens_and_preserves_password(): void
    {
        $owner = $this->asRole('superadmin');
        $user = User::factory()->create();
        $password = $user->password;
        $user->createToken('existing-session');
        $this->patchJson('/api/v1/management/staff/'.$user->id, ['name' => $user->name, 'status' => 'active', 'role' => 'manager'])->assertOk();
        $this->assertSame('manager', $user->fresh()->role);
        $this->assertSame($password, $user->fresh()->password);
        $this->assertSame(0, $user->tokens()->count());
        $this->assertDatabaseHas('admin_audit_logs', ['actor_id' => $owner->id, 'action' => 'staff.updated', 'subject_id' => $user->id]);
        $user->createToken('new-session');
        $this->patchJson('/api/v1/management/staff/'.$user->id, ['name' => $user->name, 'status' => 'active', 'role' => 'user'])->assertOk();
        $this->assertSame([], $user->fresh()->management_permissions);
        $this->assertSame(0, $user->tokens()->count());
    }

    public function test_superadmin_accounts_cannot_be_demoted_suspended_or_created_via_ui(): void
    {
        $owner = $this->asRole('superadmin');
        $other = User::factory()->create(['role' => 'superadmin']);
        foreach ([$owner, $other] as $user) {
            $this->patchJson('/api/v1/management/staff/'.$user->id, ['name' => 'Changed', 'role' => 'user', 'status' => 'suspended'])->assertUnprocessable();
            $this->assertSame('superadmin', $user->fresh()->role);
        }
        $customer = User::factory()->create();
        $this->patchJson('/api/v1/management/staff/'.$customer->id, ['name' => 'Changed', 'role' => 'superadmin', 'status' => 'active'])->assertUnprocessable();
        $this->postJson('/api/v1/management/roles', ['name' => 'Owner', 'slug' => 'superadmin', 'is_active' => true, 'permissions' => []])->assertUnprocessable();
        $this->postJson('/api/v1/management/roles', ['name' => 'Escalated', 'slug' => 'escalated', 'is_active' => true, 'permissions' => ['staff.manage']])->assertUnprocessable();
    }

    public function test_manager_can_manage_customers_but_cannot_change_pricing_payments_or_roles(): void
    {
        $manager = $this->asRole('manager');
        $customer = User::factory()->create();
        $this->getJson('/api/v1/management/customers')->assertOk()->assertJsonCount(1, 'data.data');
        $this->patchJson('/api/v1/management/customers/'.$customer->id, ['name' => 'Updated', 'status' => 'active'])->assertOk();
        $this->getJson('/api/v1/management/subscriptions')->assertOk();
        $this->postJson('/api/v1/management/plans', [])->assertForbidden();
        $this->getJson('/api/v1/management/payments')->assertForbidden();
        $this->getJson('/api/v1/management/audit')->assertForbidden();
        $this->getJson('/api/v1/management/overview')->assertOk()->assertJsonCount(0, 'data.payments_this_month')->assertJsonCount(0, 'data.recent_activity');
        $this->getJson('/api/v1/management/customers/'.$manager->id)->assertNotFound();
    }

    public function test_viewer_can_read_but_cannot_mutate_and_support_cannot_read_billing(): void
    {
        $this->asRole('viewer');
        $customer = User::factory()->create();
        $this->getJson('/api/v1/management/plans')->assertOk();
        $this->patchJson('/api/v1/management/customers/'.$customer->id, ['name' => 'Changed', 'status' => 'suspended'])->assertForbidden();
        $this->postJson('/api/v1/management/subscriptions', [])->assertForbidden();
        $this->asRole('support');
        $this->getJson('/api/v1/management/subscriptions')->assertForbidden();
        $this->getJson('/api/v1/management/customers/'.$customer->id)->assertOk()->assertJsonCount(0, 'data.subscriptions')->assertJsonPath('data.plan', null);
        $this->getJson('/api/v1/admin/abuse-reports')->assertOk();
    }

    public function test_custom_roles_validate_permissions_and_revoke_assigned_sessions_when_edited(): void
    {
        $this->asRole('superadmin');
        $created = $this->postJson('/api/v1/management/roles', ['name' => 'Operations', 'slug' => 'operations', 'is_active' => true, 'permissions' => ['subscriptions.manage']])->assertOk();
        $id = $created->json('data.id');
        $this->assertContains('subscriptions.view', $created->json('data.permissions'));
        $this->assertContains('plans.view', $created->json('data.permissions'));
        $user = User::factory()->create(['role' => 'operations']);
        $user->createToken('web');
        $this->putJson('/api/v1/management/roles/'.$id, ['name' => 'Operations', 'slug' => 'operations', 'is_active' => false, 'permissions' => ['subscriptions.view']])->assertOk();
        $this->assertSame([], $user->fresh()->management_permissions);
        $this->assertSame(0, $user->tokens()->count());
        $customerRole = StaffRole::where('slug', 'user')->firstOrFail();
        $this->putJson('/api/v1/management/roles/'.$customerRole->id, ['name' => 'Customer', 'slug' => 'user', 'is_active' => true, 'permissions' => ['plans.manage']])->assertUnprocessable();
    }

    public function test_new_users_receive_setup_emails_and_are_not_automatically_verified(): void
    {
        Notification::fake();
        $this->asRole('superadmin');
        $response = $this->postJson('/api/v1/management/staff', ['name' => 'New Manager', 'email' => 'new-manager@example.com', 'role' => 'manager', 'email_verified_at' => now()])->assertCreated();
        $user = User::findOrFail($response->json('data.id'));
        $this->assertNull($user->email_verified_at);
        $this->assertSame([], $user->management_permissions);
        Notification::assertSentTo($user, VerifyEmail::class);
        Notification::assertSentTo($user, ResetPassword::class);
        $this->postJson('/api/v1/management/staff', ['name' => 'Duplicate', 'email' => $user->email, 'role' => 'manager'])->assertUnprocessable();
    }

    public function test_reset_links_use_resolved_frontend_configuration(): void
    {
        config()->set('shortener.frontend_url', 'https://247.bd');
        $user = User::factory()->create();
        $url = (new ResetPassword('test-token'))->toMail($user)->actionUrl;
        $this->assertStringStartsWith('https://247.bd/reset-password?', $url);
    }

    public function test_existing_admins_keep_their_original_permissions_during_migration(): void
    {
        $legacy = User::factory()->create(['role' => 'admin']);
        Schema::drop('staff_roles');
        $migration = require database_path('migrations/2026_10_31_000002_create_staff_roles.php');
        $migration->up();
        app(RolePermissions::class)->forget();
        $this->assertSame('legacy-admin', $legacy->fresh()->role);
        $this->assertTrue($legacy->fresh()->canManage('moderation.manage'));
        $this->assertFalse($legacy->fresh()->canManage('payments.manage'));
        $this->assertTrue($legacy->fresh()->isAdmin());
    }
}
