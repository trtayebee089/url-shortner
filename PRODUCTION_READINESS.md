# Production readiness runbook

This document records the operator checks that cannot be proven solely by a source test suite. It is not a compliance certification.

## Pre-deployment gates

- Security: generate unique secrets; exact CORS; HTTPS-only cookies; private MySQL/Redis; edge strips spoofed geo/proxy headers; legal/security contacts replaced.
- Redirect correctness: verify 302, query/fragment preservation, 404 missing, 410 inactive/expired, cache miss/hit, corrupted cache repair, Redis fallback, and edit/disable/delete invalidation.
- Authentication and authorization: verify SMTP delivery, email verification, password reset, token expiry/revocation, disabled accounts, ownership/IDOR, scoped tokens, and admin role plus ability checks.
- Database integrity: back up and restore-test; migrate a production-like MySQL clone; confirm binary unique short-code indexes and aggregate uniqueness; review cascade behavior.
- Redis and queues: enable persistence appropriate to the service; alert on connection failures, `failed_jobs`, queue depth/age, retries, and worker restarts. Redirects survive cache/queue outage, but analytics events can be lost while enqueueing is unavailable.
- Analytics/privacy: set a dedicated HMAC key and retention; document purposes; keep raw IPs out; enable location only when justified; prune raw events and daily visitor hashes.
- Abuse: configure anonymous limits, blocked domains, moderation ownership, incident contacts, and an edge bot challenge escalation path.
- SEO: verify production canonical/OG URLs, SSR output, robots/sitemap, and noindex headers on auth/dashboard pages.
- UI: review the 390px, 768px, 1280px, and 1440px layouts against `Design Inspiration/`; verify real account data, resource routes, empty/error/loading states, and keyboard navigation.
- Deployment: validate Nginx syntax and TLS chain on the target; run PHP-FPM/Nuxt as restricted users; configure log rotation, backups, health checks, Supervisor/systemd, scheduler, and zero-downtime worker restart.
- Observability: alert on redirect 5xx/latency, authentication/rate-limit anomalies, Redis/MySQL failures, queue failures/depth, disk, certificate expiry, and backup failures. Never ingest credentials or raw authorization headers.

## Release commands

```bash
cd backend
composer install --no-dev --prefer-dist --classmap-authoritative
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan queue:restart

cd ../frontend
npm ci
npm run test
npm run typecheck
npm run lint
npm run build
```

Before switching traffic, run the repository validation commands in `README.md`, `nginx -t`, a MySQL clean-migration rehearsal, an actual Redis/worker smoke test, and the browser acceptance flow. Roll back the release artifact—not the database—unless the migration rollback has been explicitly proven safe.
