<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password as PasswordBroker;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create($request->safe()->only(['name', 'email', 'password']));
        $user->sendEmailVerificationNotification();

        $token = $user->createToken($request->string('device_name', 'web'), ['*'], now()->addHours(12));

        return response()->json(['data' => ['user' => $user, 'token' => $token->plainTextToken], 'message' => 'Account created. Please verify your email.'], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->string('email'))->first();
        if (! $user || ! Hash::check($request->string('password'), $user->password) || $user->status !== 'active') {
            Log::notice('Authentication failed.', [
                'email_hash' => hash_hmac('sha256', strtolower((string) $request->input('email')), (string) config('app.key')),
                'ip_hash' => hash_hmac('sha256', (string) $request->ip(), (string) config('app.key')),
            ]);
            throw ValidationException::withMessages(['email' => ['The provided credentials are incorrect.']]);
        }
        $token = $user->createToken($request->string('device_name', 'web'), ['*'], $request->boolean('remember') ? now()->addDays(30) : now()->addHours(12));

        return response()->json(['data' => ['user' => $user, 'token' => $token->plainTextToken], 'message' => 'Signed in successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['data' => null, 'message' => 'Signed out successfully.']);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        PasswordBroker::sendResetLink($request->only('email'));

        return response()->json(['data' => null, 'message' => 'If that email exists, a reset link has been sent.']);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = PasswordBroker::reset($request->only('email', 'password', 'password_confirmation', 'token'), function (User $user, string $password) {
            $user->forceFill(['password' => Hash::make($password), 'remember_token' => Str::random(60)])->save();
            $user->tokens()->delete();
            event(new PasswordReset($user));
        });
        if ($status !== PasswordBroker::PASSWORD_RESET) {
            throw ValidationException::withMessages(['email' => [__($status)]]);
        }

        return response()->json(['data' => null, 'message' => 'Password reset successfully.']);
    }

    public function resendVerification(Request $request): JsonResponse
    {
        if (! $request->user()->hasVerifiedEmail()) {
            $request->user()->sendEmailVerificationNotification();
        }

        return response()->json(['data' => null, 'message' => 'Verification email sent.']);
    }
}
