<?php

namespace App\Providers;

use App\Services\Abuse\ConfiguredUrlSafetyProvider;
use App\Services\Abuse\UrlSafetyProvider;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(UrlSafetyProvider::class, ConfiguredUrlSafetyProvider::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(fn ($user, string $token) => rtrim((string) env('FRONTEND_URL', 'http://localhost:3000'), '/').'/reset-password?token='.$token.'&email='.urlencode($user->getEmailForPasswordReset()));

        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(config('shortener.rate_limits.api'))->by($request->user()?->id ?: $request->ip()));
        RateLimiter::for('auth', fn (Request $request) => Limit::perMinute(config('shortener.rate_limits.auth'))->by(strtolower((string) $request->input('email')).'|'.$request->ip()));
        RateLimiter::for('password-reset', fn (Request $request) => Limit::perMinute(config('shortener.rate_limits.password_reset'))->by(strtolower((string) $request->input('email')).'|'.$request->ip()));
        RateLimiter::for('link-create', fn (Request $request) => Limit::perMinute(config($request->user() ? 'shortener.rate_limits.authenticated_create' : 'shortener.rate_limits.anonymous_create'))->by($request->user()?->id ?: $request->ip()));
        RateLimiter::for('analytics', fn (Request $request) => Limit::perMinute(config('shortener.rate_limits.analytics'))->by($request->user()->id));
        RateLimiter::for('abuse-reports', fn (Request $request) => Limit::perMinute(config('shortener.rate_limits.abuse_reports'))->by($request->ip()));
        RateLimiter::for('verification', fn (Request $request) => Limit::perMinute(config('shortener.rate_limits.verification'))->by($request->user()->id));
    }
}
