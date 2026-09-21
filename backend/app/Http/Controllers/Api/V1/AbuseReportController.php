<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AbuseReport;
use App\Models\Link;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class AbuseReportController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['short_code' => ['required', 'string', 'max:64'], 'reporter_email' => ['nullable', 'email', 'max:255'], 'reason' => ['required', Rule::in(['malware', 'phishing', 'spam', 'illegal', 'other'])], 'details' => ['nullable', 'string', 'max:2000']]);
        $link = Link::where('short_code', $data['short_code'])->first();
        $report = AbuseReport::create([...$data, 'link_id' => $link?->id]);
        Log::notice('Abuse report submitted.', ['report_id' => $report->id, 'link_id' => $link?->id, 'reason' => $data['reason']]);

        return response()->json(['data' => null, 'message' => 'Report received for moderation.'], 201);
    }
}
