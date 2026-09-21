<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE links MODIFY short_code VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL');
            DB::statement('ALTER TABLE links MODIFY custom_alias VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL');
        }

        Schema::table('link_clicks', function (Blueprint $table) {
            $table->uuid('event_id')->nullable()->after('id')->unique();
        });

        Schema::create('link_daily_visitors', function (Blueprint $table) {
            $table->foreignId('link_id')->constrained()->cascadeOnDelete();
            $table->date('stat_date');
            $table->string('visitor_hash', 64);
            $table->timestamp('created_at')->useCurrent();
            $table->primary(['link_id', 'stat_date', 'visitor_hash'], 'link_daily_visitors_primary');
            $table->index('stat_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('link_daily_visitors');
        Schema::table('link_clicks', function (Blueprint $table) {
            $table->dropUnique(['event_id']);
            $table->dropColumn('event_id');
        });
    }
};
