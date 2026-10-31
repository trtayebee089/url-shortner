<?php

namespace App\Services;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class StripeBillingService
{
    public function enabled(): bool
    {
        return (bool) config('services.stripe.enabled') && filled(config('services.stripe.secret')) && filled(config('services.stripe.webhook_secret'));
    }

    public function api(string $method, string $path, array $data = [], ?string $key = null): array
    {
        abort_unless(filled(config('services.stripe.secret')), 503, 'Stripe billing is not configured.');
        $request = Http::withToken(config('services.stripe.secret'))->withHeaders(['Stripe-Version' => config('services.stripe.api_version')])->acceptJson()->asForm()->connectTimeout(10)->timeout(25);
        if ($key) {
            $request = $request->withHeaders(['Idempotency-Key' => $key]);
        }
        try {
            $response = $method === 'get' ? $request->get('https://api.stripe.com/v1/'.$path, $data) : $request->post('https://api.stripe.com/v1/'.$path, $data);
        } catch (ConnectionException $exception) {
            Log::warning('Stripe connection failed.');
            abort(502, 'Stripe is temporarily unavailable. Please try again.');
        }
        if (! $response->successful()) {
            Log::warning('Stripe request failed.', ['status' => $response->status(), 'request_id' => $response->header('Request-Id')]);
            abort(502, 'Stripe could not complete this request. Please try again.');
        }

        return $response->json();
    }

    public function validatePrices(array $data): void
    {
        foreach (['monthly' => 'month', 'yearly' => 'year'] as $period => $interval) {
            if (empty($data['stripe_'.$period.'_price_id'])) {
                continue;
            }
            abort_unless($this->enabled(), 422, 'Configure and enable Stripe before linking Stripe prices.');
            $price = $this->api('get', 'prices/'.$data['stripe_'.$period.'_price_id']);
            if (($price['active'] ?? false) !== true || ($price['recurring']['interval'] ?? null) !== $interval || ($price['recurring']['interval_count'] ?? 1) !== 1 || strtoupper($price['currency']) !== $data['currency'] || $price['unit_amount'] !== $data[$period.'_price']) {
                throw ValidationException::withMessages(['stripe_'.$period.'_price_id' => ['Stripe price must be active and match this plan’s amount, currency and billing interval.']]);
            }
        }
    }

    public function checkout(User $user, Plan $plan, string $interval): string
    {
        abort_unless($this->enabled(), 503, 'Online payments are not enabled yet. Contact us to arrange a plan.');
        $price = $interval === 'month' ? $plan->stripe_monthly_price_id : $plan->stripe_yearly_price_id;
        abort_unless($plan->is_active && $plan->is_public && filled($price), 422, 'This plan is not available for online checkout.');
        abort_if(app(BillingService::class)->current($user) !== null, 422, 'You already have a subscription. Use Manage billing or contact support.');
        if (! $user->stripe_customer_id) {
            $customer = $this->api('post', 'customers', ['email' => $user->email, 'name' => $user->name, 'metadata' => ['user_id' => $user->id]], '247url-customer-'.$user->id);
            $user->forceFill(['stripe_customer_id' => $customer['id']])->save();
        }
        $subscriptions = $this->api('get', 'subscriptions', ['customer' => $user->stripe_customer_id, 'status' => 'all', 'limit' => 100]);
        foreach ($subscriptions['data'] as $subscription) {
            abort_unless(in_array($subscription['status'], ['canceled', 'incomplete_expired'], true), 422, 'A Stripe subscription already exists. Use Manage billing.');
        }
        $pending = DB::table('billing_checkouts')->where('user_id', $user->id)->first();
        if ($pending && now()->lt($pending->expires_at)) {
            abort_unless($pending->price_id === $price, 422, 'Finish or wait for your existing checkout to expire before choosing another plan.');
            if ($pending->url) {
                return $pending->url;
            }
        } else {
            DB::table('billing_checkouts')->updateOrInsert(['user_id' => $user->id], ['price_id' => $price, 'request_key' => (string) Str::uuid(), 'session_id' => null, 'url' => null, 'expires_at' => now()->addMinutes(31)]);
            $pending = DB::table('billing_checkouts')->where('user_id', $user->id)->first();
        }
        $frontend = rtrim(config('shortener.frontend_url'), '/');
        $session = $this->api('post', 'checkout/sessions', [
            'mode' => 'subscription', 'customer' => $user->stripe_customer_id, 'client_reference_id' => (string) $user->id,
            'line_items' => [['price' => $price, 'quantity' => 1]],
            'subscription_data' => ['metadata' => ['user_id' => $user->id, 'plan_id' => $plan->id]],
            'success_url' => $frontend.'/dashboard/billing?checkout=success', 'cancel_url' => $frontend.'/dashboard/billing?checkout=cancelled',
            'expires_at' => strtotime($pending->expires_at),
        ], $pending->request_key);
        DB::table('billing_checkouts')->where('user_id', $user->id)->update(['session_id' => $session['id'], 'url' => $session['url']]);

        return $session['url'];
    }

    public function synchronize(array $object): void
    {
        $user = User::where('stripe_customer_id', $object['customer'])->lockForUpdate()->first();
        if (! $user) {
            return;
        }
        // Retrieve the current state while holding the customer lock; deliveries can arrive out of order.
        $stripe = $this->api('get', 'subscriptions/'.$object['id']);
        $item = $stripe['items']['data'][0] ?? null;
        abort_unless($item && count($stripe['items']['data']) === 1 && $item['quantity'] === 1, 422, 'Unsupported Stripe subscription structure.');
        $price = $item['price'];
        $plan = Plan::where('stripe_monthly_price_id', $price['id'])->orWhere('stripe_yearly_price_id', $price['id'])->first();
        $existing = Subscription::where('stripe_subscription_id', $stripe['id'])->first();
        abort_unless($plan || $existing, 422, 'Stripe price is not linked to an application plan.');
        $status = $stripe['status'] === 'canceled' ? 'cancelled' : $stripe['status'];
        Subscription::updateOrCreate(['stripe_subscription_id' => $stripe['id']], [
            'user_id' => $user->id, 'plan_id' => $plan?->id ?? $existing->plan_id, 'provider' => 'stripe', 'status' => $status,
            'interval' => $price['recurring']['interval'], 'amount' => $price['unit_amount'], 'currency' => strtoupper($price['currency']),
            'starts_at' => date('Y-m-d H:i:s', $stripe['current_period_start'] ?? $item['current_period_start']),
            'ends_at' => date('Y-m-d H:i:s', $stripe['current_period_end'] ?? $item['current_period_end']),
            'cancel_at_period_end' => $stripe['cancel_at_period_end'], 'cancelled_at' => isset($stripe['canceled_at']) ? date('Y-m-d H:i:s', $stripe['canceled_at']) : null,
        ]);
        app(BillingService::class)->audit(null, 'stripe.subscription_synced', 'user', $user->id, ['status' => $status]);
    }
}
