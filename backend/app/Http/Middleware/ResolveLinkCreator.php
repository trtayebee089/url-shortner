<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ResolveLinkCreator
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::guard('sanctum')->user();

        if ($request->bearerToken() !== null && $user === null) {
            throw new AuthenticationException;
        }

        if ($user === null) {
            return $next($request);
        }

        $request->setUserResolver(static fn () => $user);

        abort_unless($user->status === 'active', 403, 'This account is disabled.');
        abort_unless($user->hasVerifiedEmail(), 403, 'Your email address is not verified.');
        abort_unless($user->tokenCan('links:write'), 403, 'Invalid ability provided.');

        return $next($request);
    }
}
