<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureManagementPermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        abort_unless($request->user()?->canManage($permission), 403, 'You do not have permission for this action.');

        return $next($request);
    }
}
