<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Link;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AnalyticsController extends Controller
{
    public function __construct(private readonly AnalyticsService $analytics) {}

    public function show(Request $request, Link $link): JsonResponse
    {
        $this->authorize('view', $link);
        $period = $request->validate(['period' => ['sometimes', Rule::in(['7d', '30d', '90d'])]])['period'] ?? '30d';

        return response()->json(['data' => $this->analytics->forLink($link, $period)]);
    }
}
