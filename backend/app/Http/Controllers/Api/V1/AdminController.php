<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AbuseReport;
use App\Models\Link;
use App\Models\User;
use App\Services\UrlShorteningService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json(['data' => ['users' => User::count(), 'links' => Link::count(), 'clicks' => Link::sum('clicks_count'), 'open_reports' => AbuseReport::where('status', 'open')->count()]]);
    }

    public function users(): JsonResponse
    {
        return response()->json(['data' => User::latest()->paginate(50)]);
    }

    public function links(): JsonResponse
    {
        return response()->json(['data' => Link::with('user:id,name,email')->latest()->paginate(50)]);
    }

    public function reports(): JsonResponse
    {
        return response()->json(['data' => AbuseReport::latest()->paginate(50)]);
    }

    public function disable(Request $request, Link $link, UrlShorteningService $shortener): JsonResponse
    {
        $link->update(['is_active' => false]);
        $shortener->forget($link->short_code);
        Log::warning('Administrator disabled a short link.', ['admin_id' => $request->user()->id, 'link_id' => $link->id]);

        return response()->json(['data' => $link, 'message' => 'Link disabled.']);
    }
}
