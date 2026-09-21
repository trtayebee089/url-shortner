<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $isMySql = Schema::getConnection()->getDriverName() === 'mysql';

        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 24)->default('user')->index();
            $table->string('status', 24)->default('active')->index();
        });

        Schema::create('links', function (Blueprint $table) use ($isMySql) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $shortCode = $table->string('short_code', 64);
            $customAlias = $table->string('custom_alias', 64)->nullable();
            if ($isMySql) {
                $shortCode->charset('ascii')->collation('ascii_bin');
                $customAlias->charset('ascii')->collation('ascii_bin');
            }
            $shortCode->unique();
            $customAlias->unique();
            $table->text('destination_url');
            $table->string('title', 160)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamp('expires_at')->nullable()->index();
            $table->unsignedBigInteger('clicks_count')->default(0);
            $table->timestamps();
            $table->index(['user_id', 'created_at']);
            $table->index(['is_active', 'expires_at']);
        });

        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name', 60);
            $table->string('slug', 60);
            $table->timestamps();
            $table->unique(['user_id', 'slug']);
        });

        Schema::create('link_tag', function (Blueprint $table) {
            $table->foreignId('link_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['link_id', 'tag_id']);
        });

        Schema::create('link_clicks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('link_id')->constrained()->cascadeOnDelete();
            $table->timestamp('clicked_at')->index();
            $table->string('visitor_hash', 64)->nullable();
            $table->string('referrer_host')->nullable();
            $table->string('country_code', 2)->nullable();
            $table->string('region', 100)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('device_type', 24)->nullable();
            $table->string('browser', 60)->nullable();
            $table->string('operating_system', 60)->nullable();
            $table->json('utm')->nullable();
            $table->timestamps();
            $table->index(['link_id', 'clicked_at']);
            $table->index(['link_id', 'visitor_hash', 'clicked_at'], 'click_unique_lookup');
        });

        Schema::create('link_daily_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('link_id')->constrained()->cascadeOnDelete();
            $table->date('stat_date');
            $table->unsignedBigInteger('clicks')->default(0);
            $table->unsignedBigInteger('unique_clicks')->default(0);
            $table->timestamps();
            $table->unique(['link_id', 'stat_date']);
        });

        Schema::create('abuse_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('link_id')->nullable()->constrained()->nullOnDelete();
            $table->string('short_code', 64)->index();
            $table->string('reporter_email')->nullable();
            $table->string('reason', 60);
            $table->text('details')->nullable();
            $table->string('status', 24)->default('open')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('abuse_reports');
        Schema::dropIfExists('link_daily_stats');
        Schema::dropIfExists('link_clicks');
        Schema::dropIfExists('link_tag');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('links');
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropIndex(['status']);
            $table->dropColumn(['role', 'status']);
        });
    }
};
