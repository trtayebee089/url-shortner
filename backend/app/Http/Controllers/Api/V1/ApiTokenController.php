<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApiTokenController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()->tokens()->select('id', 'name', 'last_used_at', 'expires_at', 'created_at')->latest()->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:100'], 'expires_in_days' => ['nullable', 'integer', 'min:1', 'max:365']]);
        $expiresAt = isset($data['expires_in_days']) ? now()->addDays($data['expires_in_days']) : now()->addDays(90);
        $token = $request->user()->createToken($data['name'], ['links:read', 'links:write', 'analytics:read'], $expiresAt);

        return response()->json(['data' => ['token' => $token->plainTextToken, 'expires_at' => $expiresAt->toIso8601String()], 'message' => 'Copy this token now. It will not be shown again.'], 201);
    }

    public function destroy(Request $request, int $token): JsonResponse
    {
        $deleted = $request->user()->tokens()->whereKey($token)->delete();
        abort_unless($deleted, 404);

        return response()->json(['data' => null, 'message' => 'API token revoked.']);
    }
}
