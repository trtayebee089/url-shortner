<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

class ShortLinkCache
{
    private static bool $failureLogged = false;

    public function get(string $code): mixed
    {
        try {
            return Cache::get($this->key($code));
        } catch (Throwable $exception) {
            $this->reportFailure('read', $exception);

            return null;
        }
    }

    public function put(string $code, array $metadata, int $ttl): void
    {
        try {
            Cache::put($this->key($code), $metadata, $ttl);
        } catch (Throwable $exception) {
            $this->reportFailure('write', $exception);
        }
    }

    public function forget(string $code): void
    {
        try {
            Cache::forget($this->key($code));
        } catch (Throwable $exception) {
            $this->reportFailure('invalidate', $exception);
        }
    }

    private function key(string $code): string
    {
        return 'short-link:'.$code;
    }

    private function reportFailure(string $operation, Throwable $exception): void
    {
        if (self::$failureLogged) {
            return;
        }

        self::$failureLogged = true;
        Log::warning('Short-link cache unavailable; database fallback remains active.', [
            'operation' => $operation,
            'exception' => $exception::class,
        ]);
    }
}
