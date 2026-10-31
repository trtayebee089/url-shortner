<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\ManualPayment;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\BillingService;
use App\Services\StripeBillingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rule;

class ManagementController extends Controller
{
    public function __construct(private BillingService $billing) {}

    public function overview()
    {
        return response()->json(['data' => [
            'customers' => User::where('role', 'user')->count(),
            'active_customers' => User::where('role', 'user')->where('status', 'active')->count(),
            'active_subscriptions' => Subscription::whereIn('status', ['active', 'trialing'])->where('starts_at', '<=', now())->where('ends_at', '>', now())->count(),
            'expiring_soon' => Subscription::whereIn('status', ['active', 'trialing'])->whereBetween('ends_at', [now(), now()->addDays(7)])->count(),
            'payments_this_month' => ManualPayment::where('status', 'paid')->where('paid_at', '>=', now()->startOfMonth())->select('currency')->selectRaw('SUM(amount) as amount')->groupBy('currency')->get(),
            'stripe_enabled' => app(StripeBillingService::class)->enabled(),
            'recent_activity' => AdminAuditLog::with('actor:id,name,email')->latest('id')->limit(8)->get(),
        ]]);
    }

    public function customers(Request $request)
    {
        $data = $request->validate(['search' => 'nullable|string|max:120', 'status' => 'nullable|in:active,suspended', 'page' => 'nullable|integer|min:1']);

        return response()->json(['data' => User::query()->withCount('links')
            ->when($data['search'] ?? null, fn ($q, $search) => $q->where(fn ($q) => $q->where('email', 'like', '%'.$search.'%')->orWhere('name', 'like', '%'.$search.'%')))
            ->when($data['status'] ?? null, fn ($q, $status) => $q->where('status', $status))->latest('id')->paginate(20)]);
    }

    public function customer(User $user)
    {
        return response()->json(['data' => ['user' => $user->loadCount('links'), 'subscriptions' => Subscription::where('user_id', $user->id)->with('plan')->latest('id')->get(), 'plan' => $this->billing->plan($user)]]);
    }

    public function updateCustomer(Request $request, User $user)
    {
        abort_unless($user->role === 'user', 422, 'Administrator accounts cannot be changed here.');
        $data = $request->validate(['name' => 'required|string|max:120', 'status' => 'required|in:active,suspended']);
        DB::transaction(function () use ($user, $data, $request) {
            $before = $user->only(['name', 'status']);
            $user->update($data);
            if ($user->status !== 'active') {
                $user->tokens()->delete();
            }
            $this->billing->audit($request->user(), 'customer.updated', 'user', $user->id, ['before' => $before, 'after' => $data]);
        });

        return response()->json(['data' => $user->fresh(), 'message' => 'Customer updated.']);
    }

    public function resetPassword(Request $request, User $user)
    {
        abort_unless($user->role === 'user', 422, 'Use the account recovery page for administrator accounts.');
        $status = Password::sendResetLink(['email' => $user->email]);
        abort_unless($status === Password::RESET_LINK_SENT, 422, __($status));
        $this->billing->audit($request->user(), 'customer.password_reset_requested', 'user', $user->id, []);

        return response()->json(['message' => 'Password reset email sent.']);
    }

    public function plans()
    {
        return response()->json(['data' => Plan::orderBy('sort_order')->get()]);
    }

    public function savePlan(Request $request, ?Plan $plan = null)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100', 'slug' => ['required', 'alpha_dash', 'max:100', Rule::unique('plans')->ignore($plan?->id)],
            'description' => 'nullable|string|max:500', 'currency' => 'required|in:USD,EUR,GBP,BDT',
            'monthly_price' => 'nullable|integer|min:0|max:100000000', 'yearly_price' => 'nullable|integer|min:0|max:100000000',
            'link_limit' => 'nullable|integer|min:1|max:10000000', 'features' => 'required|array|max:20', 'features.*' => 'required|string|max:180',
            'is_active' => 'required|boolean', 'is_public' => 'required|boolean', 'sort_order' => 'required|integer|min:0|max:999',
            'stripe_monthly_price_id' => ['nullable', 'regex:/^price_[A-Za-z0-9]+$/', Rule::unique('plans')->ignore($plan?->id)],
            'stripe_yearly_price_id' => ['nullable', 'regex:/^price_[A-Za-z0-9]+$/', Rule::unique('plans')->ignore($plan?->id)],
        ]);
        if ($plan?->is_default) {
            abort_unless($data['is_active'] && $data['is_public'] && $data['monthly_price'] === 0 && $data['yearly_price'] === 0, 422, 'The default Free plan must remain active, public and free.');
        }
        app(StripeBillingService::class)->validatePrices($data);
        $plan = DB::transaction(function () use ($plan, $data, $request) {
            $before = $plan?->toArray();
            $plan ??= new Plan;
            $plan->fill($data)->save();
            $this->billing->audit($request->user(), 'plan.saved', 'plan', $plan->id, ['before' => $before, 'after' => $plan->toArray()]);

            return $plan;
        });

        return response()->json(['data' => $plan, 'message' => 'Plan saved. Existing subscription prices are preserved.']);
    }

    public function subscriptions(Request $request)
    {
        $request->validate(['search' => 'nullable|string|max:120', 'status' => 'nullable|in:active,trialing,expired,cancelled,past_due,unpaid,incomplete,paused', 'page' => 'nullable|integer|min:1']);
        $query = Subscription::with(['user:id,name,email', 'plan']);
        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->whereHas('user', fn ($q) => $q->where('email', 'like', '%'.$search.'%')->orWhere('name', 'like', '%'.$search.'%'));
        }
        if ($request->status === 'expired') {
            $query->where('status', '!=', 'cancelled')->where('ends_at', '<=', now());
        } elseif ($request->filled('status')) {
            $query->where('status', $request->status);
            if (in_array($request->status, ['active', 'trialing'])) {
                $query->where('starts_at', '<=', now())->where('ends_at', '>', now());
            }
        }

        return response()->json(['data' => $query->latest('id')->paginate(20)]);
    }

    public function assign(Request $request)
    {
        $data = $request->validate(['user_id' => 'required|exists:users,id', 'plan_id' => 'required|exists:plans,id', 'interval' => 'required|in:month,year', 'status' => 'required|in:active,trialing', 'amount' => 'required|integer|min:0|max:100000000', 'starts_at' => 'required|date', 'ends_at' => 'required|date|after:starts_at', 'notes' => 'nullable|string|max:2000']);
        $subscription = DB::transaction(function () use ($data, $request) {
            $user = User::lockForUpdate()->findOrFail($data['user_id']);
            abort_unless($user->role === 'user' && $user->status === 'active', 422, 'Choose an active customer account.');
            $plan = Plan::findOrFail($data['plan_id']);
            abort_unless($plan->is_active, 422, 'This plan is archived.');
            $overlap = Subscription::where('user_id', $user->id)->whereNotIn('status', ['cancelled', 'incomplete_expired'])->where('ends_at', '>', $data['starts_at'])->where('starts_at', '<', $data['ends_at'])->exists();
            abort_if($overlap, 422, 'An existing subscription overlaps these dates. Cancel or end it first.');
            $subscription = Subscription::create($data + ['currency' => $plan->currency, 'provider' => 'manual']);
            $this->billing->audit($request->user(), 'subscription.assigned', 'subscription', $subscription->id, $subscription->toArray());

            return $subscription;
        });

        return response()->json(['data' => $subscription->load(['user:id,name,email', 'plan']), 'message' => 'Subscription assigned. No payment was charged.'], 201);
    }

    public function cancel(Request $request, Subscription $subscription)
    {
        abort_unless($subscription->provider === 'manual', 422, 'Manage Stripe subscriptions through the Stripe billing portal.');
        DB::transaction(function () use ($subscription, $request) {
            $subscription->update(['status' => 'cancelled', 'cancelled_at' => now()]);
            $this->billing->audit($request->user(), 'subscription.cancelled', 'subscription', $subscription->id, []);
        });

        return response()->json(['data' => $subscription->fresh(), 'message' => 'Subscription cancelled. No refund was issued.']);
    }

    public function payments(Request $request)
    {
        return response()->json(['data' => ManualPayment::with('subscription.user:id,name,email')->latest('id')->paginate(20)]);
    }

    public function recordPayment(Request $request)
    {
        $data = $request->validate(['subscription_id' => 'required|exists:subscriptions,id', 'amount' => 'required|integer|min:1|max:100000000', 'method' => 'required|in:bank_transfer,cash,mobile_banking,other', 'reference' => 'required|string|max:150|unique:manual_payments', 'paid_at' => 'required|date|before_or_equal:now', 'notes' => 'nullable|string|max:2000']);
        $subscription = Subscription::findOrFail($data['subscription_id']);
        abort_unless($subscription->provider === 'manual', 422, 'Stripe payments are managed in Stripe; do not record them twice.');
        $payment = DB::transaction(function () use ($data, $subscription, $request) {
            $payment = ManualPayment::create($data + ['currency' => $subscription->currency, 'recorded_by' => $request->user()->id]);
            $this->billing->audit($request->user(), 'payment.recorded', 'payment', $payment->id, $payment->toArray());

            return $payment;
        });

        return response()->json(['data' => $payment, 'message' => 'Manual payment recorded.'], 201);
    }

    public function voidPayment(Request $request, ManualPayment $payment)
    {
        DB::transaction(function () use ($payment, $request) {
            $payment->update(['status' => 'void']);
            $this->billing->audit($request->user(), 'payment.voided', 'payment', $payment->id, []);
        });

        return response()->json(['message' => 'Payment record voided. No money was refunded.']);
    }

    public function audit()
    {
        return response()->json(['data' => AdminAuditLog::with('actor:id,name,email')->latest('id')->paginate(30)]);
    }
}
