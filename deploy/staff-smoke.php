<?php

if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$root = '/home/u246888667/domains/247.bd/public_html/api';
require $root.'/vendor/autoload.php';
$app = require $root.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$owner = App\Models\User::where('role', 'superadmin')->where('status', 'active')->firstOrFail();
$fixture = App\Models\User::create(['name' => 'Release permission check (temporary)', 'email' => 'staff-check-'.Illuminate\Support\Str::lower(Illuminate\Support\Str::random(16)).'@example.invalid', 'password' => Illuminate\Support\Str::random(64), 'role' => 'user', 'status' => 'active']);
$fixture->forceFill(['email_verified_at' => now()])->save();
$ownerToken = $owner->createToken('staff-release-check', ['*'], now()->addMinutes(2));
$oldToken = $fixture->createToken('staff-release-check', ['*'], now()->addMinutes(2));
$passed = true;
$check = function ($token, string $method, string $path, int $expected, array $data = []) use (&$passed) {
    $request = Illuminate\Support\Facades\Http::withToken($token)->acceptJson()->timeout(20);
    $url = 'https://api.247.bd/api/v1/'.$path;
    $response = $method === 'get' ? $request->get($url) : $request->{$method}($url, $data);
    echo $method.' '.$path.': '.$response->status().' (expected '.$expected.')'.PHP_EOL;
    $passed = $passed && $response->status() === $expected;
};
try {
    $check($ownerToken->plainTextToken, 'get', 'management/staff', 200);
    $check($ownerToken->plainTextToken, 'get', 'management/roles', 200);
    $check($ownerToken->plainTextToken, 'patch', 'management/staff/'.$fixture->id, 200, ['name' => $fixture->name, 'role' => 'manager', 'status' => 'active']);
    $check($oldToken->plainTextToken, 'get', 'auth/me', 401);
    $managerToken = $fixture->createToken('staff-release-check', ['*'], now()->addMinutes(2));
    foreach (['management/customers' => 200, 'management/subscriptions' => 200, 'management/payments' => 403, 'management/audit' => 403, 'management/staff' => 403, 'management/roles' => 403] as $path => $status) {
        $check($managerToken->plainTextToken, 'get', $path, $status);
    }
    $check($managerToken->plainTextToken, 'post', 'management/roles', 403);
    $check($ownerToken->plainTextToken, 'patch', 'management/staff/'.$fixture->id, 200, ['name' => $fixture->name, 'role' => 'viewer', 'status' => 'active']);
    $check($managerToken->plainTextToken, 'get', 'auth/me', 401);
    $viewerToken = $fixture->createToken('staff-release-check', ['*'], now()->addMinutes(2));
    $check($viewerToken->plainTextToken, 'get', 'management/plans', 200);
    $check($viewerToken->plainTextToken, 'post', 'management/subscriptions', 403);
    echo 'stripe_enabled: '.(app(App\Services\StripeBillingService::class)->enabled() ? 'true' : 'false').PHP_EOL;
    echo 'staff_role_count: '.App\Models\StaffRole::count().PHP_EOL;
} finally {
    $ownerToken->accessToken->delete();
    $fixture->tokens()->delete();
    $fixture->delete();
    echo 'Temporary verification user and tokens removed.'.PHP_EOL;
}
exit($passed ? 0 : 1);
