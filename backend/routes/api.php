<?php

use App\Http\Controllers\Api\V1\AbuseReportController;
use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\ApiTokenController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\LinkController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\QrCodeController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('throttle:api')->group(function () {
    Route::prefix('auth')->group(function () {
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

    Route::post('public/links', [LinkController::class, 'storeAnonymous'])->middleware('throttle:anonymous-create');
    Route::post('abuse-reports', [AbuseReportController::class, 'store'])->middleware('throttle:abuse-reports');

    Route::middleware(['auth:sanctum', 'active', 'verified'])->group(function () {
        Route::get('dashboard', DashboardController::class)->middleware('ability:links:read,analytics:read');
        Route::get('analytics', [AnalyticsController::class, 'index'])->middleware(['abilities:analytics:read', 'throttle:analytics']);
        Route::post('links', [LinkController::class, 'store'])->middleware(['abilities:links:write', 'throttle:authenticated-create']);
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

        Route::prefix('admin')->middleware(['abilities:admin', 'admin'])->group(function () {
            Route::get('stats', [AdminController::class, 'stats']);
            Route::get('users', [AdminController::class, 'users']);
            Route::get('links', [AdminController::class, 'links']);
            Route::get('abuse-reports', [AdminController::class, 'reports']);
            Route::post('links/{link}/disable', [AdminController::class, 'disable']);
        });
    });
});
