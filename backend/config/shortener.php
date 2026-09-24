<?php

return [
    'domain' => env('SHORT_URL_DOMAIN', env('APP_URL', 'http://localhost:8000')),
    'frontend_url' => env('FRONTEND_URL', env('APP_URL', 'http://localhost:8000')),
    'code_length' => (int) env('SHORT_CODE_LENGTH', 7),
    'max_generation_attempts' => (int) env('SHORT_CODE_MAX_ATTEMPTS', 8),
    'redirect_status' => (int) env('SHORT_REDIRECT_STATUS', 302),
    'cache_ttl_seconds' => (int) env('SHORT_LINK_CACHE_TTL', 3600),
    'negative_cache_ttl_seconds' => (int) env('SHORT_LINK_NEGATIVE_CACHE_TTL', 60),
    'allow_anonymous' => (bool) env('ALLOW_ANONYMOUS_LINKS', true),
    'reserved_aliases' => array_filter(array_map('trim', explode(',', env(
        'SHORT_RESERVED_ALIASES',
        'admin,api,login,register,dashboard,settings,pricing,about,contact,terms,privacy,auth,logout,robots.txt,sitemap.xml,features,faq,resources,verify-email,forgot-password,reset-password,blog,docs'
    )))),
    'blocked_domains' => array_filter(array_map('strtolower', array_map('trim', explode(',', env('SHORT_BLOCKED_DOMAINS', ''))))),
    'analytics_retention_days' => (int) env('ANALYTICS_RETENTION_DAYS', 90),
    'analytics_hash_key' => env('ANALYTICS_HASH_KEY') ?: env('APP_KEY'),
    'trust_geo_headers' => (bool) env('ANALYTICS_TRUST_GEO_HEADERS', false),
    'store_location' => (bool) env('ANALYTICS_STORE_LOCATION', false),
    'rate_limits' => [
        'anonymous_create' => (int) env('RATE_LIMIT_ANONYMOUS_CREATE', 10),
        'authenticated_create' => (int) env('RATE_LIMIT_AUTHENTICATED_CREATE', 60),
        'api' => (int) env('RATE_LIMIT_API', 120),
        'auth' => (int) env('RATE_LIMIT_AUTH', 5),
        'social_auth' => (int) env('RATE_LIMIT_SOCIAL_AUTH', 18),
        'password_reset' => (int) env('RATE_LIMIT_PASSWORD_RESET', 3),
        'analytics' => (int) env('RATE_LIMIT_ANALYTICS', 60),
        'abuse_reports' => (int) env('RATE_LIMIT_ABUSE_REPORTS', 6),
        'verification' => (int) env('RATE_LIMIT_VERIFICATION', 6),
    ],
];
