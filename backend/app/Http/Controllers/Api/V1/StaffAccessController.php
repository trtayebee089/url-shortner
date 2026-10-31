<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\StaffRole;
use App\Models\User;
use App\Services\BillingService;
use App\Services\RolePermissions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Laravel\Sanctum\PersonalAccessToken;
use Throwable;

class StaffAccessController extends Controller
{
    public function index(Request $request)
    {
        $data = $request->validate(['search' => 'nullable|string|max:120', 'role' => 'nullable|string|max:24', 'status' => 'nullable|in:active,suspended', 'page' => 'nullable|integer|min:1']);

        return response()->json(['data' => User::query()
            ->when($data['search'] ?? null, fn ($q, $value) => $q->where(fn ($q) => $q->where('name', 'like', '%'.$value.'%')->orWhere('email', 'like', '%'.$value.'%')))
            ->when($data['role'] ?? null, fn ($q, $value) => $q->where('role', $value))
            ->when($data['status'] ?? null, fn ($q, $value) => $q->where('status', $value))
            ->latest('id')->paginate(20)]);
    }

    public function roles()
    {
        return response()->json(['data' => ['roles' => StaffRole::withCount('users')->orderBy('is_system', 'desc')->orderBy('name')->get(), 'permissions' => RolePermissions::CATALOG]]);
    }

    public function create(Request $request, BillingService $audit)
    {
        $request->merge(['email' => strtolower(trim((string) $request->input('email')))]);
        $data = $request->validate(['name' => 'required|string|max:120', 'email' => 'required|email:rfc|max:255|unique:users,email', 'role' => ['required', Rule::exists('staff_roles', 'slug')->where('is_active', true)]]);
        $user = DB::transaction(function () use ($request, $audit, $data) {
            $user = User::create($data + ['password' => Str::random(64), 'status' => 'active']);
            $audit->audit($request->user(), 'staff.created', 'user', $user->id, $user->only(['name', 'email', 'role', 'status']));

            return $user;
        });
        $sent = $this->sendSetup($user);

        return response()->json(['data' => $user, 'message' => $sent ? 'Account created. Verification and password setup emails sent.' : 'Account created, but setup emails could not be sent. Use Send setup emails to retry.'], 201);
    }

    public function update(Request $request, User $user, BillingService $audit)
    {
        $data = $request->validate(['name' => 'required|string|max:120', 'status' => 'required|in:active,suspended', 'role' => ['required', Rule::exists('staff_roles', 'slug')->where('is_active', true)]]);
        DB::transaction(function () use ($request, $user, $data, $audit) {
            $user = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            abort_if($user->role === 'superadmin' || $user->id === $request->user()->id, 422, 'Superadmin access and your own account cannot be changed here.');
            $role = StaffRole::where('slug', $data['role'])->lockForUpdate()->firstOrFail();
            abort_unless($role->is_active, 422, 'This role has been disabled.');
            $before = $user->only(['name', 'role', 'status']);
            $changedAccess = $user->role !== $data['role'] || $user->status !== $data['status'];
            $user->update($data);
            if ($changedAccess) {
                $user->tokens()->delete();
            }
            $audit->audit($request->user(), 'staff.updated', 'user', $user->id, ['before' => $before, 'after' => $data, 'sessions_revoked' => $changedAccess]);
        });

        return response()->json(['data' => $user->fresh(), 'message' => 'Account updated. Access changes require the user to sign in again.']);
    }

    public function setup(Request $request, User $user, BillingService $audit)
    {
        abort_if($user->role === 'superadmin', 422, 'Use the normal recovery page for superadmin accounts.');
        abort_unless($user->status === 'active', 422, 'Activate the account before sending setup emails.');
        $sent = $this->sendSetup($user);
        abort_unless($sent, 422, 'Setup emails could not be sent or were requested too recently. Please try again later.');
        $audit->audit($request->user(), 'staff.setup_sent', 'user', $user->id, []);

        return response()->json(['message' => 'Account setup emails sent.']);
    }

    private function sendSetup(User $user): bool
    {
        try {
            if (! $user->hasVerifiedEmail()) {
                $user->sendEmailVerificationNotification();
            }

            return Password::sendResetLink(['email' => $user->email]) === Password::RESET_LINK_SENT;
        } catch (Throwable $exception) {
            Log::warning('Staff setup email failed.', ['user_id' => $user->id, 'exception' => get_class($exception)]);

            return false;
        }
    }

    public function saveRole(Request $request, BillingService $audit, ?StaffRole $role = null)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => ['required', 'regex:/^[a-z][a-z0-9_-]{1,23}$/', Rule::notIn(['superadmin', 'super-admin', 'super_admin']), Rule::unique('staff_roles')->ignore($role?->id)],
            'is_active' => 'required|boolean', 'permissions' => 'present|array', 'permissions.*' => ['string', 'distinct', Rule::in(array_keys(RolePermissions::CATALOG))],
        ]);
        // Every write permission includes its matching read permission.
        foreach ($data['permissions'] as $permission) {
            if (str_ends_with($permission, '.manage')) {
                $data['permissions'][] = str_replace('.manage', '.view', $permission);
            }
        }
        $data['permissions'] = array_values(array_unique($data['permissions']));
        if (in_array('subscriptions.manage', $data['permissions'], true)) {
            $data['permissions'] = [...$data['permissions'], 'plans.view', 'customers.view'];
        }
        if (in_array('payments.manage', $data['permissions'], true)) {
            $data['permissions'][] = 'subscriptions.view';
        }
        $data['permissions'] = array_values(array_unique($data['permissions']));
        $role = DB::transaction(function () use ($request, $audit, $role, $data) {
            $role = $role ? StaffRole::whereKey($role->id)->lockForUpdate()->firstOrFail() : new StaffRole;
            abort_if($role->exists && $role->slug === 'user', 422, 'The customer role cannot receive staff permissions.');
            abort_if($role->exists && $role->slug !== $data['slug'], 422, 'A role identifier cannot be changed. Create another role instead.');
            $before = $role->exists ? $role->toArray() : null;
            $role->fill($data)->save();
            // Role edits apply to existing users, and existing tokens are revoked.
            PersonalAccessToken::where('tokenable_type', (new User)->getMorphClass())->whereIn('tokenable_id', User::where('role', $role->slug)->select('id'))->delete();
            $audit->audit($request->user(), 'role.saved', 'role', $role->id, ['before' => $before, 'after' => $role->toArray()]);

            return $role;
        });
        app(RolePermissions::class)->forget();

        return response()->json(['data' => $role, 'message' => 'Role saved. Assigned users must sign in again.']);
    }
}
