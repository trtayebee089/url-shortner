<?php

namespace App\Http\Controllers;

use App\Services\RedirectService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectController extends Controller
{
    public function __invoke(string $shortCode, Request $request, RedirectService $redirects): Response
    {
        $result = $redirects->resolve($shortCode, $request);
        if ($result['state'] === 'missing') {
            abort(404);
        }
        if ($result['state'] === 'disabled') {
            return response()->view('link-unavailable', ['reason' => 'This link has been disabled.'], 410);
        }
        if ($result['state'] === 'expired') {
            return response()->view('link-unavailable', ['reason' => 'This link has expired.'], 410);
        }

        return redirect()->away($result['destination_url'], config('shortener.redirect_status'), ['Cache-Control' => 'private, no-store']);
    }
}
