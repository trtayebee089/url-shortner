<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class SafeHttpUrl implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || strlen($value) > 4096 || preg_match('/[\x00-\x1F\x7F]/', $value)) {
            $fail('The :attribute must be a valid HTTP or HTTPS URL.');

            return;
        }

        $parts = parse_url($value);
        $scheme = strtolower((string) ($parts['scheme'] ?? ''));
        $host = (string) ($parts['host'] ?? '');

        if (! in_array($scheme, ['http', 'https'], true) || $host === '' || isset($parts['user']) || isset($parts['pass'])) {
            $fail('The :attribute must be a valid HTTP or HTTPS URL without embedded credentials.');

            return;
        }

        $asciiHost = function_exists('idn_to_ascii') ? idn_to_ascii($host, IDNA_DEFAULT, INTL_IDNA_VARIANT_UTS46) : $host;
        if ($asciiHost === false || ! filter_var($scheme.'://'.$asciiHost, FILTER_VALIDATE_URL)) {
            $fail('The :attribute contains an invalid domain.');
        }
    }
}
