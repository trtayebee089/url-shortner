<?php

declare(strict_types=1);

$url = $argv[1] ?? '';
$requests = isset($argv[2]) ? max(1, min((int) $argv[2], 10000)) : 100;
if (! filter_var($url, FILTER_VALIDATE_URL) || ! in_array(parse_url($url, PHP_URL_SCHEME), ['http', 'https'], true)) {
    fwrite(STDERR, "Usage: php scripts/benchmark-redirect.php <short-url> [requests]\n");
    exit(1);
}

$context = stream_context_create(['http' => [
    'follow_location' => 0,
    'ignore_errors' => true,
    'timeout' => 5,
    'header' => "User-Agent: 247URL-local-benchmark/1.0\r\n",
]]);
$latencies = [];
$statuses = [];

for ($i = 0; $i < $requests; $i++) {
    $started = hrtime(true);
    @file_get_contents($url, false, $context);
    $latencies[] = (hrtime(true) - $started) / 1_000_000;
    $statusLine = $http_response_header[0] ?? 'HTTP/0 000';
    preg_match('/\s(\d{3})\s/', $statusLine, $matches);
    $status = $matches[1] ?? '000';
    $statuses[$status] = ($statuses[$status] ?? 0) + 1;
}

sort($latencies);
$percentile = static fn (float $value): float => $latencies[(int) floor(($requests - 1) * $value)];
printf(
    "requests=%d statuses=%s min=%.2fms median=%.2fms p95=%.2fms max=%.2fms\n",
    $requests,
    json_encode($statuses, JSON_THROW_ON_ERROR),
    $latencies[0],
    $percentile(0.5),
    $percentile(0.95),
    $latencies[$requests - 1],
);
