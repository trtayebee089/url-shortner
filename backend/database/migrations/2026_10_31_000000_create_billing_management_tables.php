<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->string('description', 500)->nullable();
            $table->char('currency', 3)->default('USD');
            $table->unsignedInteger('monthly_price')->nullable();
            $table->unsignedInteger('yearly_price')->nullable();
            $table->unsignedInteger('link_limit')->nullable();
            $table->json('features');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_public')->default(true);
            $table->boolean('is_default')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('plan_id')->constrained()->restrictOnDelete();
            $table->string('status', 20)->index();
            $table->string('interval', 10);
            $table->unsignedInteger('amount');
            $table->char('currency', 3);
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->index();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status']);
        });
        Schema::create('manual_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_id')->constrained()->restrictOnDelete();
            $table->foreignId('recorded_by')->constrained('users')->restrictOnDelete();
            $table->unsignedInteger('amount');
            $table->char('currency', 3);
            $table->string('method', 40);
            $table->string('reference', 150)->unique();
            $table->string('status', 12)->default('paid');
            $table->timestamp('paid_at');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
        Schema::create('admin_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 80)->index();
            $table->string('subject_type', 40);
            $table->unsignedBigInteger('subject_id');
            $table->json('changes');
            $table->timestamp('created_at')->useCurrent();
        });
        $now = now();
        foreach ([
            ['name' => 'Free', 'slug' => 'free', 'monthly_price' => 0, 'yearly_price' => 0, 'is_default' => true, 'description' => 'For individuals getting started.', 'features' => ['Short links', 'Custom aliases', 'Basic analytics', 'QR codes']],
            ['name' => 'Pro', 'slug' => 'pro', 'monthly_price' => 1200, 'yearly_price' => 11520, 'is_default' => false, 'description' => 'For growing link workflows.', 'features' => ['Everything in Free', 'API access', 'Priority support']],
            ['name' => 'Business', 'slug' => 'business', 'monthly_price' => null, 'yearly_price' => null, 'is_default' => false, 'description' => 'A tailored plan for your organization.', 'features' => ['Custom agreement', 'Dedicated support']],
        ] as $i => $plan) {
            $plan['features'] = json_encode($plan['features']);
            DB::table('plans')->insert($plan + ['currency' => 'USD', 'sort_order' => $i, 'is_active' => true, 'is_public' => true, 'created_at' => $now, 'updated_at' => $now]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_audit_logs');
        Schema::dropIfExists('manual_payments');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('plans');
    }
};
