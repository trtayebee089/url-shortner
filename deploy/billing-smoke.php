<?php

if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$root = '/home/u246888667/domains/247.bd/public_html/api';
require $root.'/vendor/autoload.php';
$app = require $root.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$owner = App\Models\User::where('role', 'superadmin')->where('status', 'active')->firstOrFail();
$token = $owner->createToken('release-verification', ['*'], now()->addMinutes(2));
try {
    $allPassed = true;
    foreach (['auth/me', 'management/overview', 'management/customers', 'management/plans', 'management/subscriptions', 'management/payments', 'management/audit', 'billing'] as $path) {
        $response = Illuminate\Support\Facades\Http::withToken($token->plainTextToken)->acceptJson()->timeout(20)->get('https://api.247.bd/api/v1/'.$path);
        echo $path.': '.$response->status().PHP_EOL;
        $allPassed = $allPassed && $response->successful();
    }
    echo 'stripe_enabled: '.(app(App\Services\StripeBillingService::class)->enabled() ? 'true' : 'false').PHP_EOL;
    echo 'owner_verified: '.($owner->hasVerifiedEmail() ? 'true' : 'false').PHP_EOL;
    echo 'database_driver: '.Illuminate\Support\Facades\DB::connection()->getDriverName().PHP_EOL;

} finally {
    $token->accessToken->delete();
}
exit($allPassed ? 0 : 1);
