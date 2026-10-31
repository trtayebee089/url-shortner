<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RolePermissions
{
    public const CATALOG = [
        'overview.view' => 'View platform overview',
        'customers.view' => 'View customers',
        'customers.manage' => 'Edit and suspend customers; send password resets',
        'plans.view' => 'View plans',
        'plans.manage' => 'Create and edit pricing plans',
        'subscriptions.view' => 'View subscriptions',
        'subscriptions.manage' => 'Assign and cancel manual subscriptions',
        'payments.view' => 'View manual payment records',
        'payments.manage' => 'Record and void manual payments',
        'moderation.view' => 'View platform links and abuse reports',
        'moderation.manage' => 'Disable platform links',
        'audit.view' => 'View administrative audit history',
    ];

    public const DEFAULTS = [
        'user' => [],
        'legacy-admin' => ['overview.view', 'customers.view', 'moderation.view', 'moderation.manage'],
        'admin' => ['overview.view', 'customers.view', 'customers.manage', 'plans.view', 'plans.manage', 'subscriptions.view', 'subscriptions.manage', 'payments.view', 'payments.manage', 'moderation.view', 'moderation.manage', 'audit.view'],
        'manager' => ['overview.view', 'customers.view', 'customers.manage', 'plans.view', 'subscriptions.view', 'subscriptions.manage'],
        'support' => ['overview.view', 'customers.view', 'customers.manage', 'moderation.view', 'moderation.manage'],
        'billing' => ['overview.view', 'customers.view', 'plans.view', 'subscriptions.view', 'subscriptions.manage', 'payments.view', 'payments.manage'],
        'viewer' => ['overview.view', 'customers.view', 'plans.view', 'subscriptions.view'],
    ];

    private ?array $definitions = null;

    public function forRole(?string $role): array
    {
        if ($role === 'superadmin') {
            return [...array_keys(self::CATALOG), 'staff.manage'];
        }
        if ($role === null || $role === 'user') {
            return [];
        }
        if ($this->definitions === null) {
            // Keep existing admin access working during the additive migration.
            $this->definitions = Schema::hasTable('staff_roles')
                ? DB::table('staff_roles')->where('is_active', true)->get()->mapWithKeys(fn ($record) => [$record->slug => json_decode($record->permissions, true)])->all()
                : array_replace(self::DEFAULTS, ['admin' => self::DEFAULTS['legacy-admin']]);
        }

        return array_values(array_intersect(array_keys(self::CATALOG), $this->definitions[$role] ?? []));
    }

    public function forget(): void
    {
        $this->definitions = null;
    }
}
