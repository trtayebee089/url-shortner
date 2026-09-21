<?php

namespace App\Services;

use App\Models\Link;
use Carbon\CarbonImmutable;

class AnalyticsService
{
    public function forLink(Link $link, string $period): array
    {
        $days = match ($period) {
            '7d' => 7, '90d' => 90, default => 30
        };
        $from = CarbonImmutable::today()->subDays($days - 1);
        $series = $link->dailyStats()->where('stat_date', '>=', $from)->orderBy('stat_date')->get()->keyBy(fn ($row) => $row->stat_date->toDateString());
        $timeline = collect(range(0, $days - 1))->map(function ($offset) use ($from, $series) {
            $date = $from->addDays($offset)->toDateString();

            return ['date' => $date, 'clicks' => $series->get($date)?->clicks ?? 0, 'unique_clicks' => $series->get($date)?->unique_clicks ?? 0];
        });
        $clicks = $link->clicks()->where('clicked_at', '>=', $from);

        return [
            'period' => $period,
            'total_clicks' => $timeline->sum('clicks'),
            'unique_clicks' => $timeline->sum('unique_clicks'),
            'timeline' => $timeline,
            'referrers' => (clone $clicks)->selectRaw("COALESCE(referrer_host, 'Direct') as label, COUNT(*) as value")->groupBy('referrer_host')->orderByDesc('value')->limit(10)->get(),
            'countries' => (clone $clicks)->selectRaw("COALESCE(country_code, 'Unknown') as label, COUNT(*) as value")->groupBy('country_code')->orderByDesc('value')->limit(10)->get(),
            'devices' => (clone $clicks)->selectRaw("COALESCE(device_type, 'Unknown') as label, COUNT(*) as value")->groupBy('device_type')->orderByDesc('value')->get(),
            'browsers' => (clone $clicks)->selectRaw("COALESCE(browser, 'Unknown') as label, COUNT(*) as value")->groupBy('browser')->orderByDesc('value')->limit(10)->get(),
            'operating_systems' => (clone $clicks)->selectRaw("COALESCE(operating_system, 'Unknown') as label, COUNT(*) as value")->groupBy('operating_system')->orderByDesc('value')->limit(10)->get(),
        ];
    }
}
