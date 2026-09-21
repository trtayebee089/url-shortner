<?php

namespace App\Services\Abuse;

interface UrlSafetyProvider
{
    /** @return array{allowed: bool, reason: string|null} */
    public function inspect(string $url): array;
}
