# 247URL production readiness report

Report timestamp: 2026-09-21 17:22:16 +06:00

Audited branch/HEAD: `main` / `a31eb017c3d6b56609c3be4d3dacf96abdbdfddd` plus uncommitted audit fixes

Decision: **BLOCKED — not published and not declared production-ready**

The detailed test/fix ledger, commands, blockers, deployment sequence, and rollback plan are in [FINAL_PRODUCTION_AUDIT.md](FINAL_PRODUCTION_AUDIT.md).

## Final gate

| Required area | Status | Evidence |
|---|---|---|
| A. Backend tests | PASS | Complete Laravel suite: 57 tests, 301 assertions; Pint passed |
| B. Frontend tests | PASS | Vitest: 3 files, 5 tests; ESLint and Nuxt typecheck passed |
| C. API tests | PASS | 29 OpenAPI operations exactly match 29 Laravel operations; OpenAPI lint passed; endpoint/validation/IDOR/rate-limit tests passed |
| D. Browser tests | PASS | Isolated production build: anonymous shorten/copy/QR; login; dashboard; create/edit/search/filter/disable; analytics; QR preview/download; profile; reset request; logout/protected-route guard |
| D. Browser tests — account/token final actions | BLOCKED | Valid registration was API-tested; browser duplicate validation passed. Browser create/revoke API token was not submitted because the UI action requires explicit confirmation |
| E. Security tests | PASS | Composer/npm found 0 advisories; malicious URL/alias, IDOR, scopes, rate limits, BFF origin logic, and headers tested; pattern-based current/history scan found no high-confidence secret signatures |
| E. Live security | BLOCKED | No final host, TLS, HSTS, production cookie/CORS/proxy, or dedicated full-history secret-scanner verification |
| F. Database tests | PASS | Temporary SQLite: all 6 migrations, seeder, scheduler commands and full rollback passed after fixing index-drop order |
| F. MySQL production rehearsal | BLOCKED | Docker/target unavailable; MySQL-specific indexes/FKs/locking not runtime-tested |
| G. Redis tests | BLOCKED | Automated outage fallback passed, but real Redis miss/hit/outage/recovery did not run |
| H. Queue tests | PASS | Database analytics worker consumed jobs; retry/backoff and terminal `failed_jobs` retention observed |
| H. Redis queue | BLOCKED | Real Redis worker/restart unavailable |
| I. Redirect tests | PASS | 302, 404, 410, disabled, expired, query/fragment passthrough, cache repair/fallback, queue isolation, no session cookie |
| J. SEO tests | PASS | SSR route HTML/titles/canonical, robots and sitemap verified locally; auth/dashboard noindex verified |
| J. Production SEO | BLOCKED | Final production URLs are unknown; localhost was expected in the isolated run |
| K. Accessibility tests | PASS | 17 public/auth and 6 hydrated dashboard pages: labels/names/alt/IDs/headings/overflow passed; keyboard focus visible |
| L. Docker tests | BLOCKED | Static Compose service resolution passed; daemon stopped, so no build/up/health/log test |
| M. Nginx tests | BLOCKED | Static review only; no `nginx -t`, TLS, PHP-FPM, proxy or caching runtime |
| N. Production build | PASS | Nuxt 3.21.11/Nitro build passed; isolated production server returned SSR pages and completed browser flows |
| N. GitHub CI / source sync | BLOCKED | `HEAD` and `origin/main` both resolve to `a31eb017c3d6b56609c3be4d3dacf96abdbdfddd`, but 12 candidate files are not committed or pushed. GitHub CI #3 failed because the PHP extensions were malformed as separate `setup-php` inputs; the workflow is corrected locally but has not run on GitHub |
| O. Deployment result | BLOCKED | No explicit target/credentials/verified backup; Hostinger inventory authentication timed out; nothing uploaded or changed |
| P. Live smoke tests | BLOCKED | No live deployment was performed |

## Fixes included in the candidate

- Laravel now appends incoming short-link query parameters before a stored fragment without removing stored query parameters.
- Analytics reads UTMs from the actual redirect URL.
- The PHP 8.3 image installs/enables `phpredis`.
- SQLite rollback drops indexed user columns safely.
- Coverage now includes API surface, token ownership, dashboard ownership, verification/reset expiry, persisted logout, `Retry-After`, and redirect-query/UTM behavior.
- GitHub Actions now passes the PHP extension list through the supported `extensions` input and includes Composer validation/audit gates.

## Actual local measurements

These are local Windows production-build samples, not production capacity claims:

| Path | Requests/status | Median | p95 |
|---|---:|---:|---:|
| Nuxt homepage SSR | 20/20 HTTP 200 | 3.63 ms | 9.66 ms |
| Laravel `/up` | 20/20 HTTP 200 | 110.21 ms | 123.06 ms |
| Short redirect (database cache/queue) | 20/20 HTTP 302 | 128.69 ms | 139.90 ms |
| Authenticated dashboard API | 20/20 HTTP 200 | 139.83 ms | 162.41 ms |

The frontend build's largest client chunk was 210.46 kB raw / 77.71 kB gzip. Lighthouse was not run.

## Deployment report

| Field | Result |
|---|---|
| Production URL | BLOCKED — not established |
| API URL | BLOCKED — not established |
| Short-link domain | BLOCKED — not established |
| Deployment timestamp | NOT APPLICABLE — no deployment |
| Git commit | BLOCKED — audited HEAD plus uncommitted fixes |
| Database migration | BLOCKED — not run on production/MySQL |
| Frontend build | PASS — local production build |
| Backend tests | PASS — 57/57 |
| Live health check | BLOCKED |
| Live redirect | BLOCKED |
| Analytics | PASS locally; BLOCKED live |
| Authentication | PASS locally; SMTP delivery BLOCKED |
| HTTPS | BLOCKED |
| No critical live errors | BLOCKED — no live log review |

## Commands executed

```text
composer validate --strict
composer audit --locked
vendor/bin/pint --test
php artisan about --only=environment,cache,drivers
php artisan route:list --except-vendor
php artisan config:show app
php artisan schedule:list
php artisan test
php artisan migrate --force              # temporary SQLite
php artisan db:seed --force              # temporary SQLite
php artisan links:expire                 # temporary SQLite
php artisan analytics:prune --days=90    # temporary SQLite
php artisan migrate:rollback --force     # temporary SQLite
php artisan queue:work database ...      # temporary SQLite
php artisan queue:failed                 # temporary SQLite
npm install
npm audit --audit-level=low
npm run test
npm run lint
npm run typecheck
npm run build
npx --yes @redocly/cli lint backend/public/openapi.yaml
docker compose config --services
docker info
docker compose ps --all
git fetch --prune origin
git ls-remote --heads origin main
```

The complete Git, browser, design-reference, performance, secret-scan, and runtime commands are recorded in `FINAL_PRODUCTION_AUDIT.md`. Sensitive configuration values were not printed.

## Actions required before publication

1. Identify and approve the exact domain(s), host/project/account, server paths, process manager, PHP socket, database, and rollback release.
2. Authenticate the hosting connector or supply the approved deployment channel without exposing secrets.
3. Produce a clean reviewed commit containing the audit and CI fixes, push it, and require the new GitHub CI run to pass.
4. Start Docker or use staging to build the image and run MySQL 8, Redis, PHP-FPM, Nuxt, workers, scheduler, and Nginx.
5. Restore a fresh production backup into an isolated MySQL database and rehearse migrations, especially analytics column alters.
6. Verify real SMTP verification/reset delivery.
7. Configure exact production environment values and validate TLS, secure cookies, CORS, trusted proxies, CSP, headers, robots/sitemap, and monitoring.
8. Follow the safe deployment and rollback procedures in `FINAL_PRODUCTION_AUDIT.md`.
9. Run live health, full smoke, real 302/query/analytics, and post-deploy log checks.

Until every blocker above is resolved, deployment remains prohibited.
