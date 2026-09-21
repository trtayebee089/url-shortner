<?php

namespace App\Services;

use LogicException;

class ShortCodeGenerator
{
    private const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

    public function generate(): string
    {
        $code = '';
        $length = (int) config('shortener.code_length');
        if ($length < 6 || $length > 32) {
            throw new LogicException('SHORT_CODE_LENGTH must be between 6 and 32.');
        }
        $max = strlen(self::ALPHABET) - 1;

        for ($i = 0; $i < $length; $i++) {
            $code .= self::ALPHABET[random_int(0, $max)];
        }

        return $code;
    }
}
