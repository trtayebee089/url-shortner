<?php

use App\Services\RolePermissions;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff_roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 24)->unique();
            $table->json('permissions');
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        foreach (RolePermissions::DEFAULTS as $slug => $permissions) {
            DB::table('staff_roles')->insert(['slug' => $slug, 'name' => $slug === 'user' ? 'Customer' : ucfirst($slug), 'permissions' => json_encode($permissions), 'is_system' => true, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        }
        // Existing administrators had moderation access only. Do not silently grant billing access.
        foreach (DB::table('users')->where('role', 'admin')->pluck('id') as $id) {
            DB::table('users')->where('id', $id)->update(['role' => 'legacy-admin']);
            DB::table('admin_audit_logs')->insert(['actor_id' => null, 'action' => 'role.legacy_access_preserved', 'subject_type' => 'user', 'subject_id' => $id, 'changes' => json_encode(['before' => 'admin', 'after' => 'legacy-admin']), 'created_at' => now()]);
        }
    }

    public function down(): void
    {
        // Never leave accounts pointing to an undefined custom role after rollback.
        DB::table('users')->where('role', 'legacy-admin')->update(['role' => 'admin']);
        DB::table('users')->whereNotIn('role', ['user', 'admin', 'superadmin'])->update(['role' => 'user']);
        Schema::dropIfExists('staff_roles');
    }
};
