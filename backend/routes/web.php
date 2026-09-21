<?php

use App\Http\Controllers\Api\V1\VerificationController;
use App\Http\Controllers\RedirectController;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;
use Illuminate\View\Middleware\ShareErrorsFromSession;

Route::get('/email/verify/{id}/{hash}', VerificationController::class)->middleware(['signed', 'throttle:6,1'])->name('verification.verify');
Route::get('/{shortCode}', RedirectController::class)
    ->withoutMiddleware([
        EncryptCookies::class,
        AddQueuedCookiesToResponse::class,
        StartSession::class,
        ShareErrorsFromSession::class,
        ValidateCsrfToken::class,
    ])
    ->where('shortCode', '[A-Za-z0-9_-]{3,64}')
    ->name('short.redirect');
