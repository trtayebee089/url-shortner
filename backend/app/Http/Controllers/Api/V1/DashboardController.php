<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\LinkResource;
use App\Models\Link;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $query = Link::whereBelongsTo($request->user());

        return response()->json(['data' => [
            'total_links' => (clone $query)->count(),
            'total_clicks' => (int) (clone $query)->sum('clicks_count'),
            'clicks_today' => (int) $request->user()->links()->join('link_daily_stats', 'links.id', '=', 'link_daily_stats.link_id')->whereDate('stat_date', today())->sum('clicks'),
            'clicks_this_month' => (int) $request->user()->links()->join('link_daily_stats', 'links.id', '=', 'link_daily_stats.link_id')->where('stat_date', '>=', now()->startOfMonth())->sum('clicks'),
            'recent_links' => LinkResource::collection((clone $query)->with('tags')->latest()->limit(5)->get()),
            'top_links' => LinkResource::collection((clone $query)->orderByDesc('clicks_count')->limit(5)->get()),
        ]]);
    }
}
