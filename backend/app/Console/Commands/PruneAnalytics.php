<?php

namespace App\Console\Commands;

use App\Models\LinkClick;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PruneAnalytics extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'analytics:prune {--days=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete raw click events beyond the configured retention period';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $days = max((int) ($this->option('days') ?: config('shortener.analytics_retention_days')), 1);
        $cutoff = now()->subDays($days);
        $deleted = LinkClick::where('clicked_at', '<', $cutoff)->delete();
        $visitorHashes = DB::table('link_daily_visitors')->where('stat_date', '<', $cutoff->toDateString())->delete();
        $this->info("Deleted {$deleted} raw analytics events and {$visitorHashes} daily visitor hashes; aggregate statistics were retained.");

        return self::SUCCESS;
    }
}
