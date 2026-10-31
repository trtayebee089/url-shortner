<?php

namespace Tests\Feature;

use App\Models\AdminAuditLog;
use App\Models\Link;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BillingManagementTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $user = User::factory()->create(['role' => 'superadmin']);
        Sanctum::actingAs($user, ['*']);

        return $user;
    }

    private function agreement(User $user): array
    {
        return ['user_id' => $user->id, 'plan_id' => Plan::where('slug', 'pro')->value('id'), 'interval' => 'month', 'status' => 'active', 'amount' => 1200, 'starts_at' => now()->subDay()->toIso8601String(), 'ends_at' => now()->addMonth()->toIso8601String(), 'notes' => 'Internal agreement'];
    }

    public function test_management_requires_superadmin_active_verified_account_and_token_scope(): void
    {
        $this->getJson('/api/v1/management/overview')->assertUnauthorized();
        foreach (['user', 'admin'] as $role) {
            Sanctum::actingAs(User::factory()->create(['role' => $role]), ['*']);
            foreach (['overview', 'customers', 'plans', 'subscriptions', 'payments', 'audit'] as $route) {
                $this->getJson('/api/v1/management/'.$route)->assertForbidden();
            }
            $this->postJson('/api/v1/management/subscriptions', [])->assertForbidden();
        }
        $admin = $this->admin();
        $this->getJson('/api/v1/management/overview')->assertOk();
        Sanctum::actingAs($admin, ['links:read']);
        $this->getJson('/api/v1/management/overview')->assertForbidden();
        Sanctum::actingAs(User::factory()->unverified()->create(['role' => 'superadmin']), ['*']);
        $this->getJson('/api/v1/management/overview')->assertForbidden();
        Sanctum::actingAs(User::factory()->create(['role' => 'superadmin', 'status' => 'suspended']), ['*']);
        $this->getJson('/api/v1/management/overview')->assertForbidden();
    }

    public function test_manual_subscription_payment_history_expiry_and_cancellation(): void
    {
        $this->admin();
        $customer = User::factory()->create();
        $payload = $this->agreement($customer);
        $response = $this->postJson('/api/v1/management/subscriptions', $payload)->assertCreated();
        $id = $response->json('data.id');
        $this->postJson('/api/v1/management/subscriptions', $payload)->assertUnprocessable();
        Plan::whereKey($payload['plan_id'])->update(['monthly_price' => 9900]);
        $this->assertSame(1200, Subscription::find($id)->amount);
        $payment = ['subscription_id' => $id, 'amount' => 1200, 'method' => 'bank_transfer', 'reference' => 'BANK-001', 'paid_at' => now()->subHour()->toIso8601String()];
        $paid = $this->postJson('/api/v1/management/payments', $payment)->assertCreated();
        $this->postJson('/api/v1/management/payments', $payment)->assertUnprocessable();
        $this->postJson('/api/v1/management/payments/'.$paid->json('data.id').'/void')->assertOk();
        $this->assertDatabaseHas('manual_payments', ['reference' => 'BANK-001', 'status' => 'void']);
        $this->postJson('/api/v1/management/subscriptions/'.$id.'/cancel')->assertOk();
        $this->assertSame('cancelled', Subscription::find($id)->effective_status);
        $this->assertGreaterThanOrEqual(4, AdminAuditLog::count());
        $this->travel(40)->days();
        $this->assertSame('cancelled', Subscription::find($id)->effective_status);
    }

    public function test_customer_cannot_edit_admins_and_suspension_revokes_tokens(): void
    {
        $admin = $this->admin();
        $this->patchJson('/api/v1/management/customers/'.$admin->id, ['name' => 'Changed', 'status' => 'suspended'])->assertUnprocessable();
        $customer = User::factory()->create();
        $customer->createToken('web');
        $this->patchJson('/api/v1/management/customers/'.$customer->id, ['name' => 'Member', 'status' => 'suspended', 'role' => 'superadmin'])->assertOk();
        $this->assertSame('user', $customer->fresh()->role);
        $this->assertSame(0, $customer->tokens()->count());
    }

    public function test_public_pricing_hides_private_and_archived_plans_and_checkout_is_disabled(): void
    {
        Plan::where('slug', 'business')->update(['is_public' => false]);
        Plan::where('slug', 'pro')->update(['is_active' => false]);
        $response = $this->getJson('/api/v1/plans')->assertOk()->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.checkout_monthly', false);
        $this->assertArrayNotHasKey('stripe_monthly_price_id', $response->json('data.0'));
        Sanctum::actingAs(User::factory()->create(), ['*']);
        $this->postJson('/api/v1/billing/checkout', ['plan_id' => Plan::first()->id, 'interval' => 'month'])->assertStatus(503);
    }

    public function test_default_plan_is_protected_and_link_limit_is_enforced_without_deleting_links(): void
    {
        $customer = User::factory()->create();
        $plan = Plan::where('is_default', true)->first();
        $plan->update(['link_limit' => 1]);
        Link::factory()->for($customer)->create();
        Sanctum::actingAs($customer, ['*']);
        $this->postJson('/api/v1/links', ['destination_url' => 'https://example.com/new'])->assertUnprocessable()->assertJsonValidationErrors('plan');
        $this->assertSame(1, $customer->links()->count());
        $this->admin();
        $data = $plan->toArray();
        $data['is_active'] = false;
        $this->putJson('/api/v1/management/plans/'.$plan->id, $data)->assertUnprocessable();
    }

    public function test_billing_history_is_scoped_and_internal_notes_are_hidden(): void
    {
        $this->admin();
        $first = User::factory()->create();
        $second = User::factory()->create();
        $this->postJson('/api/v1/management/subscriptions', $this->agreement($first))->assertCreated();
        $this->postJson('/api/v1/management/subscriptions', $this->agreement($second))->assertCreated();
        Sanctum::actingAs($first, ['*']);
        $response = $this->getJson('/api/v1/billing')->assertOk()->assertJsonCount(1, 'data.history');
        $response->assertJsonPath('data.history.0.user_id', $first->id);
        $this->assertArrayNotHasKey('notes', $response->json('data.history.0'));
    }

    public function test_stripe_webhook_rejects_forged_and_expired_signatures_and_is_idempotent(): void
    {
        config()->set('services.stripe.webhook_secret', 'whsec_test');
        config()->set('services.stripe.secret', 'sk_test_example');
        $customer = User::factory()->create(['stripe_customer_id' => 'cus_test']);
        $plan = Plan::where('slug', 'pro')->first();
        $plan->update(['stripe_monthly_price_id' => 'price_test']);
        Http::fake(['api.stripe.com/*' => Http::response(['id' => 'sub_test', 'customer' => 'cus_test', 'status' => 'active', 'current_period_start' => time() - 60, 'current_period_end' => time() + 3600, 'cancel_at_period_end' => false, 'items' => ['data' => [['quantity' => 1, 'price' => ['id' => 'price_test', 'unit_amount' => 1200, 'currency' => 'usd', 'recurring' => ['interval' => 'month']]]]]])]);
        $payload = json_encode(['id' => 'evt_test', 'type' => 'customer.subscription.updated', 'data' => ['object' => ['id' => 'sub_test', 'customer' => 'cus_test']]]);
        $this->call('POST', '/api/v1/billing/stripe/webhook', [], [], [], ['HTTP_STRIPE_SIGNATURE' => 't='.time().',v1=forged'], $payload)->assertStatus(400);
        $old = time() - 600;
        $this->call('POST', '/api/v1/billing/stripe/webhook', [], [], [], ['HTTP_STRIPE_SIGNATURE' => 't='.$old.',v1='.hash_hmac('sha256', $old.'.'.$payload, 'whsec_test')], $payload)->assertStatus(400);
        $header = 't='.time().',v1='.hash_hmac('sha256', time().'.'.$payload, 'whsec_test');
        for ($i = 0; $i < 2; $i++) {
            $this->call('POST', '/api/v1/billing/stripe/webhook', [], [], [], ['HTTP_STRIPE_SIGNATURE' => $header], $payload)->assertOk();
        }
        $this->assertSame(1, Subscription::where('user_id', $customer->id)->count());
        $this->assertSame(1, DB::table('stripe_events')->count());
        Http::assertSentCount(1);
    }

    public function test_console_provisions_owner_without_replacing_existing_password(): void
    {
        $user = User::factory()->create(['email' => 'owner@example.com']);
        $hash = $user->password;
        $this->artisan('admin:provision', ['email' => $user->email])->assertSuccessful();
        $this->assertSame('superadmin', $user->fresh()->role);
        $this->assertSame($hash, $user->fresh()->password);
    }
}
