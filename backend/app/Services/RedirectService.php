<?php

namespace App\Services;

use App\Jobs\RecordLinkClick;
use App\Models\Link;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Throwable;

class RedirectService
{
    public function __construct(private readonly ShortLinkCache $cache) {}

    /** @return array{state: string, destination_url?: string} */
    public function resolve(string $code, Request $request): array
    {
        $metadata = $this->cache->get($code);
        if (! $this->isValidMetadata($metadata)) {
            if ($metadata !== null) {
                $this->cache->forget($code);
            }

            $link = Link::query()->where('short_code', $code)->first();
            $metadata = $link ? [
                'id' => $link->id,
                'destination_url' => $link->destination_url,
                'is_active' => $link->is_active,
                'expires_at' => $link->expires_at?->toIso8601String(),
            ] : ['missing' => true];
            $ttl = $link ? (int) config('shortener.cache_ttl_seconds') : (int) config('shortener.negative_cache_ttl_seconds');
            if ($this->isValidMetadata($metadata)) {
                $this->cache->put($code, $metadata, $ttl);
            } else {
                return ['state' => 'missing'];
            }
        }

        if (isset($metadata['missing'])) {
            return ['state' => 'missing'];
        }
        if (! $metadata['is_active']) {
            return ['state' => 'disabled'];
        }
        if ($metadata['expires_at'] && now()->greaterThanOrEqualTo($metadata['expires_at'])) {
            return ['state' => 'expired'];
        }

        $destinationUrl = $this->appendRequestQuery($metadata['destination_url'], $request->getQueryString());

        try {
            RecordLinkClick::dispatch($metadata['id'], [
                'event_id' => (string) Str::uuid(),
                'clicked_at' => now()->toIso8601String(),
                'destination_url' => $destinationUrl,
                'visitor_hash' => hash_hmac('sha256', ($request->ip() ?? '').'|'.($request->userAgent() ?? '').'|'.now()->toDateString(), (string) config('shortener.analytics_hash_key')),
                'user_agent' => Str($request->userAgent())->limit(500)->toString(),
                'referer' => Str($request->headers->get('referer'))->limit(2048)->toString(),
                'country' => config('shortener.trust_geo_headers') ? Str($request->headers->get('CF-IPCountry'))->upper()->limit(2)->toString() : null,
                'region' => config('shortener.trust_geo_headers') && config('shortener.store_location') ? Str($request->headers->get('X-Geo-Region'))->limit(100)->toString() : null,
                'city' => config('shortener.trust_geo_headers') && config('shortener.store_location') ? Str($request->headers->get('X-Geo-City'))->limit(100)->toString() : null,
            ])->onQueue('analytics');
        } catch (Throwable $exception) {
            report($exception);
        }

        return ['state' => 'ok', 'destination_url' => $destinationUrl];
    }

    private function appendRequestQuery(string $destination, ?string $requestQuery): string
    {
        if ($requestQuery === null || $requestQuery === '') {
            return $destination;
        }

        $fragmentPosition = strpos($destination, '#');
        $fragment = $fragmentPosition === false ? '' : substr($destination, $fragmentPosition);
        $base = $fragmentPosition === false ? $destination : substr($destination, 0, $fragmentPosition);
        $separator = str_contains($base, '?') ? (str_ends_with($base, '?') || str_ends_with($base, '&') ? '' : '&') : '?';

        return $base.$separator.$requestQuery.$fragment;
    }

    private function isValidMetadata(mixed $metadata): bool
    {
        if (! is_array($metadata)) {
            return false;
        }

        if (($metadata['missing'] ?? false) === true) {
            return count($metadata) === 1;
        }

        if (! (isset($metadata['id'], $metadata['destination_url'], $metadata['is_active'])
            && is_int($metadata['id'])
            && is_string($metadata['destination_url'])
            && is_bool($metadata['is_active'])
            && (! isset($metadata['expires_at']) || is_string($metadata['expires_at'])))) {
            return false;
        }

        if (! $this->isSafeDestination($metadata['destination_url'])) {
            return false;
        }

        if (isset($metadata['expires_at'])) {
            try {
                CarbonImmutable::parse($metadata['expires_at']);
            } catch (Throwable) {
                return false;
            }
        }

        return true;
    }

    private function isSafeDestination(string $destination): bool
    {
        if (strlen($destination) > 4096 || preg_match('/[\x00-\x1F\x7F]/', $destination)) {
            return false;
        }

        $parts = parse_url($destination);
        $scheme = strtolower((string) ($parts['scheme'] ?? ''));
        $host = (string) ($parts['host'] ?? '');
        $asciiHost = function_exists('idn_to_ascii') ? idn_to_ascii($host, IDNA_DEFAULT, INTL_IDNA_VARIANT_UTS46) : $host;

        return is_array($parts)
            && in_array($scheme, ['http', 'https'], true)
            && $host !== ''
            && $asciiHost !== false
            && filter_var($scheme.'://'.$asciiHost, FILTER_VALIDATE_URL) !== false
            && ! isset($parts['user'])
            && ! isset($parts['pass']);
    }
}
