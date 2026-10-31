<?php

namespace App\Services;

use App\Models\AdminAuditLog;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;

class BillingService
{
    public function current(User $user): ?Subscription
    {
        return Subscription::where('user_id', $user->id)->whereIn('status', ['active', 'trialing'])
            ->where('starts_at', '<=', now())->where('ends_at', '>', now())->latest('id')->with('plan')->first();
    }

    public function plan(User $user): ?Plan
    {
        return $this->current($user)?->plan ?? Plan::where('is_default', true)->first();
    }

    public function audit(?User $actor, string $action, string $type, int $id, array $changes): void
    {
        AdminAuditLog::create(['actor_id' => $actor?->id, 'action' => $action, 'subject_type' => $type, 'subject_id' => $id, 'changes' => $changes]);
    }
}
