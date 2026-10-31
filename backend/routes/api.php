<?php

use App\Http\Controllers\Api\V1\AbuseReportController;
use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\ApiTokenController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BillingController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\LinkController;
use App\Http\Controllers\Api\V1\ManagementController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\QrCodeController;
use App\Http\Controllers\Api\V1\SocialAuthController;
use App\Http\Controllers\Api\V1\StaffAccessController;
use App\Http\Controllers\Api\V1\VerificationController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('throttle:api')->group(function () {
    Route::get('plans', [BillingController::class, 'plans']);
    Route::prefix('auth')->group(function () {
        Route::get('google', [SocialAuthController::class, 'redirect'])->defaults('provider', 'google')->middleware('throttle:social-auth');
        Route::get('{provider}/redirect', [SocialAuthController::class, 'redirect'])->whereIn('provider', ['google', 'apple'])->middleware('throttle:social-auth');
        Route::match(['get', 'post'], '{provider}/callback', [SocialAuthController::class, 'callback'])->whereIn('provider', ['google', 'apple'])->middleware('throttle:social-auth');
        Route::post('social/exchange', [SocialAuthController::class, 'exchange'])->middleware('throttle:social-auth');
        Route::post('email/verification-proof', [VerificationController::class, 'consumeProof'])->middleware('throttle:auth');
        Route::post('register', [AuthController::class, 'register'])->middleware('throttle:auth');
        Route::post('login', [AuthController::class, 'login'])->middleware('throttle:auth');
        Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:password-reset');
        Route::post('reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:password-reset');
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('email/verification-notification', [AuthController::class, 'resendVerification'])->middleware(['active', 'throttle:verification']);
        });
    });

    Route::post('links', [LinkController::class, 'store'])->middleware(['link.creator', 'throttle:link-create']);
    Route::post('abuse-reports', [AbuseReportController::class, 'store'])->middleware('throttle:abuse-reports');

    Route::middleware(['auth:sanctum', 'active', 'verified'])->group(function () {
        Route::prefix('billing')->middleware('abilities:account:manage')->group(function () {
            Route::get('/', [BillingController::class, 'show']);
            Route::post('checkout', [BillingController::class, 'checkout'])->middleware('throttle:auth');
            Route::post('portal', [BillingController::class, 'portal'])->middleware('throttle:auth');
        });
        Route::prefix('management')->middleware(['abilities:admin'])->controller(ManagementController::class)->group(function () {
            Route::get('staff', [StaffAccessController::class, 'index'])->middleware('superadmin');
            Route::post('staff', [StaffAccessController::class, 'create'])->middleware(['superadmin', 'throttle:auth']);
            Route::patch('staff/{user}', [StaffAccessController::class, 'update'])->middleware('superadmin');
            Route::post('staff/{user}/setup', [StaffAccessController::class, 'setup'])->middleware(['superadmin', 'throttle:auth']);
            Route::get('roles', [StaffAccessController::class, 'roles'])->middleware('superadmin');
            Route::post('roles', [StaffAccessController::class, 'saveRole'])->middleware('superadmin');
            Route::put('roles/{role}', [StaffAccessController::class, 'saveRole'])->middleware('superadmin');
            Route::get('overview', 'overview')->middleware('management.permission:overview.view');
            Route::get('customers', 'customers')->middleware('management.permission:customers.view');
            Route::get('customers/{user}', 'customer')->middleware('management.permission:customers.view');
            Route::patch('customers/{user}', 'updateCustomer')->middleware('management.permission:customers.manage');
            Route::post('customers/{user}/password-reset', 'resetPassword')->middleware(['management.permission:customers.manage', 'throttle:auth']);
            Route::get('plans', 'plans')->middleware('management.permission:plans.view');
            Route::post('plans', 'savePlan')->middleware('management.permission:plans.manage');
            Route::put('plans/{plan}', 'savePlan')->middleware('management.permission:plans.manage');
            Route::get('subscriptions', 'subscriptions')->middleware('management.permission:subscriptions.view');
            Route::post('subscriptions', 'assign')->middleware('management.permission:subscriptions.manage');
            Route::post('subscriptions/{subscription}/cancel', 'cancel')->middleware('management.permission:subscriptions.manage');
            Route::get('payments', 'payments')->middleware('management.permission:payments.view');
            Route::post('payments', 'recordPayment')->middleware('management.permission:payments.manage');
            Route::post('payments/{payment}/void', 'voidPayment')->middleware('management.permission:payments.manage');
            Route::get('audit', 'audit')->middleware('management.permission:audit.view');
        });
        Route::get('dashboard', DashboardController::class)->middleware('ability:links:read,analytics:read');
        Route::get('analytics', [AnalyticsController::class, 'index'])->middleware(['abilities:analytics:read', 'throttle:analytics']);
        Route::get('links', [LinkController::class, 'index'])->middleware('abilities:links:read');
        Route::get('links/{link}', [LinkController::class, 'show'])->middleware('abilities:links:read');
        Route::match(['put', 'patch'], 'links/{link}', [LinkController::class, 'update'])->middleware('abilities:links:write');
        Route::delete('links/{link}', [LinkController::class, 'destroy'])->middleware('abilities:links:write');
        Route::get('links/{link}/analytics', [AnalyticsController::class, 'show'])->middleware(['abilities:analytics:read', 'throttle:analytics']);
        Route::get('links/{link}/qr', QrCodeController::class)->middleware('abilities:links:read');
        Route::patch('profile', [ProfileController::class, 'update'])->middleware('abilities:account:manage');
        Route::put('profile/password', [ProfileController::class, 'password'])->middleware('abilities:account:manage');
        Route::get('api-tokens', [ApiTokenController::class, 'index'])->middleware('abilities:account:manage');
        Route::post('api-tokens', [ApiTokenController::class, 'store'])->middleware('abilities:account:manage');
        Route::delete('api-tokens/{token}', [ApiTokenController::class, 'destroy'])->middleware('abilities:account:manage');

        Route::prefix('admin')->middleware(['abilities:admin'])->group(function () {
            Route::get('stats', [AdminController::class, 'stats'])->middleware('management.permission:overview.view');
            Route::get('users', [AdminController::class, 'users'])->middleware('management.permission:customers.view');
            Route::get('links', [AdminController::class, 'links'])->middleware('management.permission:moderation.view');
            Route::get('abuse-reports', [AdminController::class, 'reports'])->middleware('management.permission:moderation.view');
            Route::post('links/{link}/disable', [AdminController::class, 'disable'])->middleware('management.permission:moderation.manage');
        });
    });
});

// Stripe authenticates deliveries using the raw-body signature, not a browser token.
Route::post('v1/billing/stripe/webhook', [BillingController::class, 'webhook']);
