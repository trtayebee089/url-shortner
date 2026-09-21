<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('links:expire')->everyFiveMinutes()->withoutOverlapping();
Schedule::command('analytics:prune')->dailyAt('02:15')->withoutOverlapping();
Schedule::command('queue:prune-failed --hours=168')->weekly()->withoutOverlapping();
Schedule::command('sanctum:prune-expired --hours=24')->daily()->withoutOverlapping();
Schedule::command('queue:monitor redis:analytics --max=1000')->everyMinute()->withoutOverlapping();
