<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', fn (Blueprint $table) => $table->string('stripe_customer_id')->nullable()->unique());
        Schema::table('plans', function (Blueprint $table) {
            $table->string('stripe_monthly_price_id')->nullable()->unique();
            $table->string('stripe_yearly_price_id')->nullable()->unique();
        });
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->string('provider', 12)->default('manual');
            $table->string('stripe_subscription_id')->nullable()->unique();
            $table->boolean('cancel_at_period_end')->default(false);
        });
        Schema::create('stripe_events', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('type');
            $table->timestamp('processed_at');
        });
        Schema::create('billing_checkouts', function (Blueprint $table) {
            $table->foreignId('user_id')->primary()->constrained()->cascadeOnDelete();
            $table->string('price_id');
            $table->uuid('request_key');
            $table->string('session_id')->nullable();
            $table->text('url')->nullable();
            $table->timestamp('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('billing_checkouts');
        Schema::dropIfExists('stripe_events');
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropUnique(['stripe_subscription_id']);
            $table->dropColumn(['provider', 'stripe_subscription_id', 'cancel_at_period_end']);
        });
        Schema::table('plans', function (Blueprint $table) {
            $table->dropUnique(['stripe_monthly_price_id']);
            $table->dropUnique(['stripe_yearly_price_id']);
            $table->dropColumn(['stripe_monthly_price_id', 'stripe_yearly_price_id']);
        });
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['stripe_customer_id']);
            $table->dropColumn('stripe_customer_id');
        });
    }
};
