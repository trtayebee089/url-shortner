<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate(['name' => ['required', 'string', 'max:120'], 'email' => ['required', 'email:rfc', 'max:255', Rule::unique('users')->ignore($user->id)]]);
        $emailChanged = $data['email'] !== $user->email;
        $user->fill($data);
        if ($emailChanged) {
            $user->email_verified_at = null;
        }
        $user->save();
        if ($emailChanged) {
            $user->sendEmailVerificationNotification();
        }

        return response()->json(['data' => $user, 'message' => $emailChanged ? 'Profile updated. Please verify your new email.' : 'Profile updated.']);
    }

    public function password(Request $request): JsonResponse
    {
        $data = $request->validate(['current_password' => ['required', 'current_password'], 'password' => ['required', 'confirmed', Password::min(12)->mixedCase()->numbers()->symbols()]]);
        $request->user()->update(['password' => Hash::make($data['password'])]);
        $request->user()->tokens()->whereKeyNot($request->user()->currentAccessToken()?->getKey())->delete();

        return response()->json(['data' => null, 'message' => 'Password updated. Other sessions were signed out.']);
    }
}
