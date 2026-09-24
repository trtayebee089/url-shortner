<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class VerificationController extends Controller
{
    public function __invoke(int $id, string $hash): RedirectResponse
    {
        $user = User::findOrFail($id);
        abort_unless(hash_equals($hash, sha1($user->getEmailForVerification())), 403);
        if (! $user->hasVerifiedEmail() && $user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        $proof = Str::random(64);
        Cache::put('email-verification-proof:'.hash('sha256', $proof), true, now()->addMinutes(10));

        return redirect()->away(rtrim((string) env('FRONTEND_URL', 'http://localhost:3000'), '/').'/login?verified=1&proof='.$proof);
    }

    public function consumeProof(Request $request): JsonResponse
    {
        $proof = $request->validate(['proof' => ['required', 'string', 'size:64']])['proof'];

        return response()->json(['verified' => Cache::pull('email-verification-proof:'.hash('sha256', $proof)) === true]);
    }
}
