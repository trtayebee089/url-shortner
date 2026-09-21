<?php

namespace App\Jobs;

use App\Models\Link;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Throwable;

class RecordLinkClick implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public array $backoff = [5, 30, 120];

    public function __construct(public readonly int $linkId, public readonly array $context) {}

    public function handle(): void
    {
        $eventId = $this->context['event_id'] ?? null;
        $visitorHash = $this->context['visitor_hash'] ?? null;
        $clickedAtValue = $this->context['clicked_at'] ?? null;
        if (! is_string($eventId) || ! Str::isUuid($eventId) || ! is_string($visitorHash) || strlen($visitorHash) !== 64 || ! is_string($clickedAtValue)) {
            throw new InvalidArgumentException('Malformed analytics event context.');
        }

        $link = Link::find($this->linkId);
        if (! $link) {
            return;
        }

        $clickedAt = now()->parse($clickedAtValue);
        $userAgent = $this->context['user_agent'] ?? '';
        $analyticsDestination = is_string($this->context['destination_url'] ?? null)
            ? $this->context['destination_url']
            : $link->destination_url;
        $destinationQuery = parse_url($analyticsDestination, PHP_URL_QUERY);
        parse_str(is_string($destinationQuery) ? $destinationQuery : '', $query);
        $utm = collect($query)
            ->only(['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'])
            ->filter(fn ($value) => is_scalar($value))
            ->map(fn ($value) => Str::limit((string) $value, 200, ''))
            ->all();
        $referrerHost = parse_url($this->context['referer'] ?? '', PHP_URL_HOST) ?: null;
        $referrerHost = $referrerHost ? Str::lower(Str::limit($referrerHost, 255, '')) : null;
        [$device, $browser, $os] = $this->classifyUserAgent($userAgent);

        DB::transaction(function () use ($eventId, $visitorHash, $link, $clickedAt, $utm, $referrerHost, $device, $browser, $os) {
            $now = now();
            $inserted = DB::table('link_clicks')->insertOrIgnore([
                'event_id' => $eventId,
                'link_id' => $link->id,
                'clicked_at' => $clickedAt,
                'visitor_hash' => $visitorHash,
                'referrer_host' => $referrerHost,
                'country_code' => $this->context['country'] ?? null,
                'region' => $this->context['region'] ?? null,
                'city' => $this->context['city'] ?? null,
                'device_type' => $device,
                'browser' => $browser,
                'operating_system' => $os,
                'utm' => $utm ? json_encode($utm, JSON_THROW_ON_ERROR) : null,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
            if ($inserted === 0) {
                return;
            }

            $link->increment('clicks_count');
            $date = $clickedAt->toDateString();
            $isUnique = DB::table('link_daily_visitors')->insertOrIgnore([
                'link_id' => $link->id,
                'stat_date' => $date,
                'visitor_hash' => $visitorHash,
                'created_at' => $now,
            ]) === 1;
            DB::table('link_daily_stats')->insertOrIgnore([
                'link_id' => $link->id,
                'stat_date' => $date,
                'clicks' => 0,
                'unique_clicks' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
            DB::table('link_daily_stats')->where('link_id', $link->id)->where('stat_date', $date)->incrementEach([
                'clicks' => 1,
                'unique_clicks' => $isUnique ? 1 : 0,
            ], ['updated_at' => $now]);
        });
    }

    public function failed(?Throwable $exception): void
    {
        Log::error('Analytics job failed.', [
            'link_id' => $this->linkId,
            'event_id' => $this->context['event_id'] ?? null,
            'exception' => $exception?->getMessage(),
        ]);
    }

    /** @return array{string, string, string} */
    private function classifyUserAgent(string $agent): array
    {
        $device = preg_match('/bot|crawler|spider/i', $agent) ? 'bot' : (preg_match('/mobile|android|iphone/i', $agent) ? 'mobile' : (preg_match('/tablet|ipad/i', $agent) ? 'tablet' : 'desktop'));
        $browser = match (true) {
            str_contains($agent, 'Edg/') => 'Edge',
            str_contains($agent, 'OPR/') => 'Opera',
            str_contains($agent, 'Chrome/') => 'Chrome',
            str_contains($agent, 'Firefox/') => 'Firefox',
            str_contains($agent, 'Safari/') => 'Safari',
            default => 'Other',
        };
        $os = match (true) {
            str_contains($agent, 'Windows') => 'Windows',
            str_contains($agent, 'Android') => 'Android',
            str_contains($agent, 'iPhone'), str_contains($agent, 'iPad') => 'iOS',
            str_contains($agent, 'Mac OS') => 'macOS',
            str_contains($agent, 'Linux') => 'Linux',
            default => 'Other',
        };

        return [$device, $browser, $os];
    }
}
