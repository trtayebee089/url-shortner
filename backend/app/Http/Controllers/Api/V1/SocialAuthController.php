<?php

namespace App\Http\Controllers\Api\V1;

use App\Exceptions\SocialAuthenticationException;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SocialAccountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\Cookie;
use Throwable;

class SocialAuthController extends Controller
{
    private const PROVIDERS = ['google', 'apple'];

    public function redirect(Request $request, string $provider): RedirectResponse
    {
        abort_unless(in_array($provider, self::PROVIDERS, true), 404);
        if (! $this->configured($provider)) {
            return $this->failure('configuration');
        }

        $state = Str::random(64);
        Cache::put($this->stateKey($provider, $state), true, now()->addMinutes(10));

        try {
            $driver = Socialite::driver($provider)->stateless()->with(['state' => $state]);
            if ($provider === 'apple') {
                $driver->cookieNonce();
            }
            $response = $driver->redirect();

            return $response->withCookie($this->stateCookie($request, $provider, $state));
        } catch (Throwable $exception) {
            Log::warning('Social login initiation failed.', ['provider' => $provider, 'exception' => get_class($exception)]);

            return $this->failure('provider');
        }
    }

    public function callback(Request $request, string $provider, SocialAccountService $accounts): RedirectResponse
    {
        abort_unless(in_array($provider, self::PROVIDERS, true), 404);
        $state = $request->input('state');
        $cookie = $request->cookie($this->stateCookieName($provider));
        if (! is_string($state) || strlen($state) !== 64 || ! is_string($cookie)
            || ! hash_equals($cookie, $state)
            || Cache::pull($this->stateKey($provider, $state)) !== true) {
            return $this->clearState($this->failure('state'), $provider);
        }

        if ($request->input('error')) {
            return $this->clearState($this->failure('cancelled'), $provider);
        }

        if (! $request->filled('code')) {
            return $this->clearState($this->failure('callback'), $provider);
        }

        try {
            $driver = Socialite::driver($provider)->stateless();
            if ($provider === 'apple') {
                $driver->cookieNonce();
            }
            $user = $accounts->resolve($provider, $driver->user());
        } catch (SocialAuthenticationException $exception) {
            return $this->clearState($this->failure($exception->reason), $provider);
        } catch (Throwable $exception) {
            Log::warning('Social login callback failed.', ['provider' => $provider, 'exception' => get_class($exception)]);

            return $this->clearState($this->failure('provider'), $provider);
        }

        $ticket = Str::random(64);
        $browserSecret = Str::random(64);
        Cache::put($this->ticketKey($ticket), [
            'user_id' => $user->id,
            'binding' => hash('sha256', $browserSecret),
        ], now()->addMinutes(5));

        $response = redirect()->away($this->frontendUrl().'/auth/complete?ticket='.$ticket);
        $response->withCookie($this->handoffCookie($request, $browserSecret));

        return $this->clearState($response, $provider);
    }

    public function exchange(Request $request): JsonResponse
    {
        $ticket = $request->validate(['ticket' => ['required', 'string', 'size:64']])['ticket'];
        $browserSecret = $request->cookie('social_auth_handoff');
        if (! is_string($browserSecret) || $browserSecret === '') {
            return response()->json(['message' => 'Social sign-in expired. Please try again.'], 422)
                ->withCookie($this->forgetHandoffCookie());
        }

        $lock = Cache::lock('social-auth-ticket-lock:'.hash('sha256', $ticket), 10);
        if (! $lock->get()) {
            return response()->json(['message' => 'Social sign-in is already being completed.'], 409);
        }

        try {
            $handoff = Cache::get($this->ticketKey($ticket));
            if (! is_array($handoff) || ! isset($handoff['binding'], $handoff['user_id'])
                || ! hash_equals($handoff['binding'], hash('sha256', $browserSecret))) {
                return response()->json(['message' => 'Social sign-in expired. Please try again.'], 422)
                    ->withCookie($this->forgetHandoffCookie());
            }

            Cache::forget($this->ticketKey($ticket));
            $user = User::find($handoff['user_id']);
            if (! $user || $user->status !== 'active') {
                return response()->json(['message' => 'This account cannot sign in.'], 403)
                    ->withCookie($this->forgetHandoffCookie());
            }

            $token = $user->createToken('web', ['*'], now()->addHours(12));

            return response()->json(['data' => ['user' => $user, 'token' => $token->plainTextToken]])
                ->withCookie($this->forgetHandoffCookie());
        } finally {
            $lock->release();
        }
    }

    private function configured(string $provider): bool
    {
        $configuration = config('services.'.$provider);
        foreach (['client_id', 'redirect'] as $key) {
            if (empty($configuration[$key])) {
                return false;
            }
        }

        if ($provider === 'google') {
            return ! empty($configuration['client_secret']);
        }

        return ! empty($configuration['team_id']) && ! empty($configuration['key_id'])
            && is_readable((string) ($configuration['private_key'] ?? ''));
    }

    private function stateKey(string $provider, string $state): string
    {
        return 'social-auth-state:'.$provider.':'.hash('sha256', $state);
    }

    private function ticketKey(string $ticket): string
    {
        return 'social-auth-ticket:'.hash('sha256', $ticket);
    }

    private function stateCookieName(string $provider): string
    {
        return 'social_auth_'.$provider.'_state';
    }

    private function stateCookie(Request $request, string $provider, string $state): Cookie
    {
        return Cookie::create($this->stateCookieName($provider))
            ->withValue($state)
            ->withPath('/api/v1/auth/'.$provider.'/callback')
            ->withExpires(time() + 600)
            ->withSecure($provider === 'apple' || app()->isProduction() || $request->isSecure())
            ->withHttpOnly(true)
            ->withSameSite($provider === 'apple' ? 'none' : 'lax');
    }

    private function clearState(RedirectResponse $response, string $provider): RedirectResponse
    {
        $response->withCookie(Cookie::create($this->stateCookieName($provider))
            ->withValue('')->withPath('/api/v1/auth/'.$provider.'/callback')
            ->withExpires(time() - 3600)
            ->withSecure($provider === 'apple' || app()->isProduction())
            ->withHttpOnly(true)->withSameSite($provider === 'apple' ? 'none' : 'lax'));

        if ($provider === 'apple') {
            $response->withCookie(Cookie::create('socialite_apple_nonce')
                ->withValue('')->withPath('/')->withExpires(time() - 3600)
                ->withSecure(true)->withHttpOnly(true)->withSameSite('none'));
        }

        return $response;
    }

    private function handoffCookie(Request $request, string $secret): Cookie
    {
        return Cookie::create('social_auth_handoff')->withValue($secret)
            ->withPath('/api/v1/auth/social/exchange')->withExpires(time() + 300)
            ->withSecure(app()->isProduction() || $request->isSecure())
            ->withHttpOnly(true)->withSameSite('lax');
    }

    private function forgetHandoffCookie(): Cookie
    {
        return Cookie::create('social_auth_handoff')->withValue('')
            ->withPath('/api/v1/auth/social/exchange')->withExpires(time() - 3600)
            ->withSecure(app()->isProduction())->withHttpOnly(true)->withSameSite('lax');
    }

    private function frontendUrl(): string
    {
        return rtrim((string) config('shortener.frontend_url'), '/');
    }

    private function failure(string $reason): RedirectResponse
    {
        return redirect()->away($this->frontendUrl().'/login?oauth_error='.$reason);
    }
}
