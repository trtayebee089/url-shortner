<?php

namespace App\Services\Abuse;

class ConfiguredUrlSafetyProvider implements UrlSafetyProvider
{
    public function inspect(string $url): array
    {
        $host = strtolower((string) parse_url($url, PHP_URL_HOST));
        foreach (config('shortener.blocked_domains', []) as $blocked) {
            if ($host === $blocked || str_ends_with($host, '.'.$blocked)) {
                return ['allowed' => false, 'reason' => 'This destination domain is blocked.'];
            }
        }

        $shortHost = strtolower((string) parse_url((string) config('shortener.domain'), PHP_URL_HOST));
        if ($shortHost !== '' && $host === $shortHost) {
            return ['allowed' => false, 'reason' => 'Short-link loops are not allowed.'];
        }

        return ['allowed' => true, 'reason' => null];
    }
}
