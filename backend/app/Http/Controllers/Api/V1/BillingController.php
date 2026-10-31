<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ManualPayment;
use App\Models\Plan;
use App\Models\Subscription;
use App\Services\BillingService;
use App\Services\StripeBillingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class BillingController extends Controller
{
    public function plans(StripeBillingService $stripe)
    {
        return response()->json(['data' => Plan::where('is_active', true)->where('is_public', true)->orderBy('sort_order')->get()->map(function ($plan) use ($stripe) {
            $data = $plan->only(['id', 'name', 'slug', 'description', 'currency', 'monthly_price', 'yearly_price', 'link_limit', 'features', 'is_default']);

            return $data + ['checkout_monthly' => $stripe->enabled() && filled($plan->stripe_monthly_price_id), 'checkout_yearly' => $stripe->enabled() && filled($plan->stripe_yearly_price_id)];
        })]);
    }

    public function show(Request $request, BillingService $billing, StripeBillingService $stripe)
    {
        $user = $request->user();

        return response()->json(['data' => [
            'plan' => $billing->plan($user), 'subscription' => $billing->current($user)?->makeHidden(['notes']),
            'history' => Subscription::where('user_id', $user->id)->with('plan')->latest('id')->limit(30)->get()->makeHidden(['notes']),
            'payments' => ManualPayment::whereHas('subscription', fn ($q) => $q->where('user_id', $user->id))->latest('id')->limit(30)->get()->makeHidden(['notes', 'recorded_by']),
            'links_used' => $user->links()->count(), 'stripe_enabled' => $stripe->enabled(), 'portal_available' => $stripe->enabled() && filled($user->stripe_customer_id),
        ]]);
    }

    public function checkout(Request $request, StripeBillingService $stripe)
    {
        $data = $request->validate(['plan_id' => 'required|exists:plans,id', 'interval' => 'required|in:month,year']);
        $lock = Cache::lock('stripe-checkout:'.$request->user()->id, 120);
        abort_unless($lock->get(), 409, 'A checkout request is already in progress.');
        try {
            return response()->json(['data' => ['url' => $stripe->checkout($request->user(), Plan::findOrFail($data['plan_id']), $data['interval'])]]);
        } finally {
            $lock->release();
        }
    }

    public function portal(Request $request, StripeBillingService $stripe)
    {
        abort_unless($stripe->enabled(), 503, 'Stripe billing is not enabled.');
        abort_unless($request->user()->stripe_customer_id, 422, 'No Stripe billing account exists yet.');
        $session = $stripe->api('post', 'billing_portal/sessions', ['customer' => $request->user()->stripe_customer_id, 'return_url' => rtrim(config('shortener.frontend_url'), '/').'/dashboard/billing']);

        return response()->json(['data' => ['url' => $session['url']]]);
    }

    public function webhook(Request $request, StripeBillingService $stripe)
    {
        $secret = config('services.stripe.webhook_secret');
        abort_unless(filled($secret), 503, 'Webhook is not configured.');
        $signature = $request->header('Stripe-Signature', '');
        $parts = [];
        foreach (explode(',', $signature) as $part) {
            $pair = explode('=', $part, 2);
            if (count($pair) === 2) {
                $parts[$pair[0]][] = $pair[1];
            }
        }
        $timestamp = $parts['t'][0] ?? '';
        abort_unless(ctype_digit($timestamp) && abs(time() - (int) $timestamp) <= 300, 400, 'Invalid webhook signature.');
        $expected = hash_hmac('sha256', $timestamp.'.'.$request->getContent(), $secret);
        abort_unless(collect($parts['v1'] ?? [])->contains(fn ($value) => hash_equals($expected, $value)), 400, 'Invalid webhook signature.');
        $event = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
        abort_unless(is_string($event['id'] ?? null) && is_string($event['type'] ?? null), 400);
        $lock = Cache::lock('stripe-event:'.$event['id'], 120);
        abort_unless($lock->get(), 409);
        try {
            DB::transaction(function () use ($event, $stripe) {
                if (DB::table('stripe_events')->where('id', $event['id'])->exists()) {
                    return;
                }
                if (in_array($event['type'], ['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted'])) {
                    $stripe->synchronize($event['data']['object']);
                }
                DB::table('stripe_events')->insert(['id' => $event['id'], 'type' => $event['type'], 'processed_at' => now()]);
            });
        } finally {
            $lock->release();
        }

        return response()->json(['received' => true]);
    }
}
