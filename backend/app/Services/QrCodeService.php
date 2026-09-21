<?php

namespace App\Services;

use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\SvgWriter;

class QrCodeService
{
    public function svg(string $url): string
    {
        return (new SvgWriter)->write(new QrCode($url, errorCorrectionLevel: ErrorCorrectionLevel::Medium, size: 360, margin: 16))->getString();
    }
}
