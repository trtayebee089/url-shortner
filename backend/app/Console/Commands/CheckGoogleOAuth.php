<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CheckGoogleOAuth extends Command
{
    protected $signature = 'oauth:check-google';

    protected $description = 'Check resolved Google OAuth configuration without displaying credentials';

    public function handle(): int
    {
        $complete = true;
        foreach (['client_id', 'client_secret', 'redirect'] as $key) {
            $present = is_string(config('services.google.'.$key)) && trim(config('services.google.'.$key)) !== '';
            $this->line($key.': '.($present ? 'present' : 'MISSING'));
            $complete = $complete && $present;
        }

        $this->line('Callback: '.config('services.google.redirect'));
        $this->line('Frontend: '.config('shortener.frontend_url'));
        $this->line('Configuration cached: '.(app()->configurationIsCached() ? 'yes' : 'no'));
        $this->line('Cache store: '.config('cache.default'));
        $this->line('CORS origins: '.implode(', ', config('cors.allowed_origins', [])));
        $this->line('This checks configuration only; the database, cache and provider round trip must also work.');

        return $complete ? self::SUCCESS : self::FAILURE;
    }
}
