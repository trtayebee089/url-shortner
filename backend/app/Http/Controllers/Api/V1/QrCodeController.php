<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Link;
use App\Services\QrCodeService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class QrCodeController extends Controller
{
    public function __invoke(Request $request, Link $link, QrCodeService $qr): Response
    {
        $this->authorize('view', $link);

        return response($qr->svg($link->short_url), 200, ['Content-Type' => 'image/svg+xml', 'Content-Disposition' => 'inline; filename="'.$link->short_code.'.svg"', 'X-Content-Type-Options' => 'nosniff']);
    }
}
