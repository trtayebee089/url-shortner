<?php

namespace App\Console\Commands;

use App\Models\Link;
use App\Services\UrlShorteningService;
use Illuminate\Console\Command;

class ExpireLinks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'links:expire';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Disable expired links without deleting user data';

    /**
     * Execute the console command.
     */
    public function handle(UrlShorteningService $shortener): int
    {
        $count = 0;
        Link::where('is_active', true)->whereNotNull('expires_at')->where('expires_at', '<=', now())->chunkById(200, function ($links) use ($shortener, &$count) {
            foreach ($links as $link) {
                $link->update(['is_active' => false]);
                $shortener->forget($link->short_code);
                $count++;
            }
        });
        $this->info("Disabled {$count} expired links.");

        return self::SUCCESS;
    }
}
