<?php

namespace App\Services;

use App\Models\Link;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    public function forUser(User $user, string $period): array
    {
        $days = $this->periodDays($period);
        $from = CarbonImmutable::today()->subDays($days - 1);
        $series = DB::table('link_daily_stats')->join('links', 'links.id', '=', 'link_daily_stats.link_id')
            ->where('links.user_id', $user->id)->where('stat_date', '>=', $from)
            ->selectRaw('stat_date, SUM(clicks) as clicks, SUM(unique_clicks) as unique_clicks')
            ->groupBy('stat_date')->orderBy('stat_date')->get()->keyBy('stat_date');
        $timeline = collect(range(0, $days - 1))->map(function ($offset) use ($from, $series) {
            $date = $from->addDays($offset)->toDateString();
            $row = $series->get($date);

            return ['date' => $date, 'clicks' => (int) ($row->clicks ?? 0), 'unique_clicks' => (int) ($row->unique_clicks ?? 0)];
        });
        $clicks = $this->userClicks($user)->where('clicked_at', '>=', $from);

        return [
            'period' => $period,
            'total_clicks' => $timeline->sum('clicks'),
            'unique_clicks' => $timeline->sum('unique_clicks'),
            'average_clicks_per_link' => round($timeline->sum('clicks') / max($user->links()->count(), 1), 1),
            'timeline' => $timeline,
            'referrers' => $this->dimension(clone $clicks, 'referrer_host', 'Direct'),
            'countries' => $this->dimension(clone $clicks, 'country_code', 'Unknown'),
            'devices' => $this->dimension(clone $clicks, 'device_type', 'Unknown', null),
            'browsers' => $this->dimension(clone $clicks, 'browser', 'Unknown'),
            'operating_systems' => $this->dimension(clone $clicks, 'operating_system', 'Unknown'),
        ];
    }

    public function forLink(Link $link, string $period): array
    {
        $days = $this->periodDays($period);
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

    private function periodDays(string $period): int
    {
        return match ($period) {
            '7d' => 7, '90d' => 90, default => 30
        };
    }

    private function userClicks(User $user): Builder
    {
        return DB::table('link_clicks')->join('links', 'links.id', '=', 'link_clicks.link_id')->where('links.user_id', $user->id);
    }

    private function dimension(Builder $query, string $column, string $fallback, ?int $limit = 10): mixed
    {
        $result = $query->selectRaw("COALESCE(link_clicks.{$column}, ?) as label, COUNT(*) as value", [$fallback])
            ->groupBy("link_clicks.{$column}")->orderByDesc('value');

        return ($limit ? $result->limit($limit) : $result)->get();
    }
}
