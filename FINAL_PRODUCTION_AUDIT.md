# 247URL final production audit

Audit date: 2026-09-21 (Asia/Dhaka)

Branch: `main`

Audited application commit: `605fcc6a94f18d55cf8894af4cc2e8c2d67610d1`, pushed to `origin/main` with passing GitHub CI #5

Environment tested: isolated local production build, temporary SQLite database, database cache/queue

Publish decision: **BLOCKED — not deployed**

Statuses are limited to `PASS`, `FAIL`, `BLOCKED`, and `NOT APPLICABLE`. `PASS` applies only to the exact test in that row.

| Category | Status | Test | Result | Fix | Verification |
|---|---|---|---|---|---|
| Frontend | PASS | `npm install`, unit tests, ESLint, TypeScript, Nuxt production build | 3 files/5 tests passed; lint/typecheck/build passed; npm reported 0 vulnerabilities | None required | Full frontend gate rerun passed |
| Backend | PASS | Composer validation/audit, Pint, routes/schedule, complete Laravel suite | 57 tests/301 assertions passed; Composer found 0 advisories; 30 app routes and 5 schedules enumerated | Added missing QA coverage | Full suite and Pint rerun passed |
| Backend | BLOCKED | Required host PHP runtime | Host CLI is PHP 8.2.12 while project requires PHP 8.3+ | Dockerfile targets PHP 8.3 | Container/target runtime not executed |
| API | PASS | OpenAPI lint and route parity | OpenAPI 3.1 valid; 29 documented operations exactly match 29 Laravel API operations | Added endpoint-surface tests | Redocly lint plus automated normalized route comparison |
| Authentication | PASS | Registration validation, login, logout/revocation, verification signatures, password reset tokens | API tests passed; browser login, reset request, logout, and post-logout guard passed | Added invalid/expired token and persisted logout tests | Full Laravel suite and isolated browser |
| Authentication | BLOCKED | Real verification/reset email delivery | Test transport only; no SMTP inbox delivery tested | None | Requires production SMTP and inbox access |
| Authorization | PASS | Two-user link/analytics/QR IDOR, token ownership, scopes, user-to-admin boundary | GET/PATCH/DELETE and admin/scoped-token denial tests passed | Added API token cross-user test | Full Laravel suite |
| Database | PASS | Fresh migration, seeder, scheduled commands, full rollback on isolated SQLite | All 6 migrations applied; seeder and cleanup commands ran; all 6 rolled back | Dropped `users.role/status` indexes before rollback columns | Second clean rehearsal passed |
| Database | BLOCKED | Production-like MySQL 8 migration/index/FK rehearsal | Docker daemon unavailable; no MySQL execution | Review found analytics hardening may lock a populated `links` table | Rehearse against a restored production-like MySQL clone |
| Redis | PASS | Failure isolation in automated redirect tests | Cache read/write failures fall back to database and do not expose errors | None | Laravel regression suite |
| Redis | BLOCKED | Real Redis cache miss/hit/outage/recovery | Docker daemon unavailable; no live Redis process tested | Added missing `phpredis` extension to backend image | Container build/runtime pending |
| Queue | PASS | Database worker success, retry/backoff, terminal failed-job retention | Valid jobs consumed; malformed job retried and persisted in `failed_jobs` | None | Isolated runtime worker and `queue:failed` |
| Queue | BLOCKED | Production Redis queue worker/restart | Redis runtime unavailable | Backend image now enables Redis extension | Compose/target worker test pending |
| Analytics | PASS | Click event, queue consumption, aggregates, idempotency, ownership, chart | Browser showed 1 click/1 unique visitor; duplicate event tests passed | Incoming short-URL UTMs are now recorded from final redirect URL | Tests plus isolated browser/worker |
| Redirects | PASS | 302, 404/410, disabled/expired, query/fragment, cache corruption, DB fallback, no session cookie | All redirect tests passed; local 302 preserved stored and incoming query plus fragment | Implemented incoming query passthrough before fragment | 14 redirect tests plus HTTP smoke |
| Redirects | BLOCKED | Redis cache-hit production path and live short domain | No Redis/production target | None | Requires staging/live runtime |
| Security | PASS | Dependency audits, current/history signature scan, URL/alias/header/IDOR review | 0 advisories; no private key/common high-confidence token signatures found; `.env` ignored | Added rate-limit header coverage and Redis image dependency | Suites and pattern scan |
| Security | BLOCKED | Live TLS/HSTS/CSP/CORS/cookie/proxy verification and dedicated history scanner | No live target; pattern scan is not a dedicated secret scanner | None | Requires target and CI scanner |
| SEO | PASS | SSR pages, titles, canonical, robots, sitemap, dashboard noindex | Requested public routes returned 200 with SSR metadata; robots/sitemap 200; auth/dashboard noindex | None | Raw production-build HTTP checks |
| SEO | BLOCKED | Final production-domain metadata | Runtime intentionally used localhost; production domain is not configured | None | Set final URLs and repeat live crawl |
| Performance | PASS | Local measured SSR/API/redirect samples | Nuxt SSR median 3.63 ms; health 110.21 ms; redirect 128.69 ms; dashboard API 139.83 ms (20 each) | None | Actual local measurements; not production throughput |
| Performance | BLOCKED | PHP-FPM/MySQL/Redis/load/Lighthouse production measurement | Target stack unavailable; Lighthouse not run | None | Requires staging/live target |
| Docker | PASS | `docker compose config --services` | 7 services resolved | Added `phpredis` to backend image | Static config only |
| Docker | BLOCKED | Build/up/health/logs | Docker Desktop service is stopped and could not be started | None | No container was built or run |
| Nginx | BLOCKED | `nginx -t`, TLS, proxy/cache/routing runtime | Static configs reviewed; Nginx runtime unavailable | No target-specific domain/socket changes made | Requires container or target |
| GitHub | PASS | Remote parity and latest CI | Candidate pushed to `origin/main`; CI #5 passed at `605fcc6` | Corrected malformed `setup-php` input, made PHPUnit discovery portable, and added Composer validation/audit | Backend and frontend jobs passed |
| Deployment | BLOCKED | Target, backup, migration, publish, live smoke | Repo uses `example.com`; Hostinger inventory auth timed out; no target/credentials/backup | Deployment intentionally stopped | Not deployed |
| Monitoring | BLOCKED | Live health, alerting, log aggregation/rotation | Health routes work locally; no live monitoring target | Required signals documented | Target configuration pending |
| Backups | BLOCKED | Production backup and isolated restore | No production database access | Procedure documented below | Neither backup nor restore was run |
| Browser UX | PASS | Shorten/copy/QR; login/dashboard/create/edit/search/filter/disable/analytics/QR/profile/logout; responsive/semantic checks | Flows passed; no console errors or overflow at 1440/1280/768/390 | Query passthrough blocker fixed | Production build browser run |
| Browser UX | BLOCKED | Browser account creation and API-token creation/revocation | Final create-token action requires explicit UI confirmation; valid registration used API | API create/list/revoke/IDOR tests added | Registration error and token-list pages checked |
| Accessibility | PASS | Labels, names, alt, IDs, headings, keyboard focus | 17 public/auth and 6 hydrated dashboard pages had no detected semantic violations; 2 px focus outlines | None | Browser script and keyboard traversal |
| Visual QA | PASS | Design reference and responsive layouts | Desktop hero typography/background matched; reference and app avoid mobile overflow; app checked at four widths | None | Built reference and browser comparison |

## Production blockers

1. Exact production domains, host/project, deployment user, process manager, paths, and PHP socket are not configured; Nginx remains an example template.
2. Hostinger website inventory did not authenticate before timeout, so no hosting target was selected or mutated.
3. Docker Desktop is installed but its daemon/service is unavailable. A hidden launch was attempted twice; starting `com.docker.service` failed because the current process cannot open the service. MySQL 8, Redis, PHP-FPM, Nginx, Compose health checks, Redis queues, and container logs were not exercised.
4. No production database backup was created/restored and no production migration was run.
5. `2026_09_19_120000_harden_analytics_events.php` requires a production-like MySQL clone and lock-duration review before release.
6. Real SMTP, production TLS/HTTPS, secure cookies, CORS, proxies, monitoring, and post-deploy logs remain unverified.
7. GitHub source synchronization and CI are complete, but they do not clear the infrastructure, backup, migration, SMTP, TLS, and live-smoke blockers above.

## Fixes made

- Preserve query parameters supplied to a short URL while keeping stored parameters and fragments.
- Attribute incoming UTM parameters to the queued analytics event.
- Install/enable `phpredis` in the PHP 8.3 image.
- Make full SQLite rollback safe by dropping role/status indexes first.
- Add API-surface, auth expiry/revocation, rate-limit/`Retry-After`, query, UTM, and IDOR tests.
- Correct GitHub Actions `setup-php` extension syntax and add Composer validation/audit gates.
- Make PHPUnit discover the complete `tests` tree without depending on an untracked empty `tests/Unit` directory.

## Commands executed

```text
git status --short --branch
git branch --show-current
git log -n 10 --oneline --decorate
git fetch --prune origin
git ls-remote --heads origin main
composer validate --strict
composer audit --locked
vendor/bin/pint --test
php artisan about --only=environment,cache,drivers
php artisan route:list --except-vendor
php artisan config:show app                 # key redacted from captured output
php artisan schedule:list
php artisan test
php artisan migrate --force                # temporary SQLite only
php artisan db:seed --force                # temporary SQLite only
php artisan links:expire                   # temporary SQLite only
php artisan analytics:prune --days=90      # temporary SQLite only
php artisan migrate:rollback --force       # temporary SQLite only
php artisan queue:work database ...        # temporary SQLite only
php artisan queue:failed                   # temporary SQLite only
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
pnpm install --frozen-lockfile             # Design Inspiration only
pnpm run build                             # Design Inspiration only
```

No `migrate:fresh`, `db:wipe`, production seeder, production migration, DNS change, upload, service restart, or deployment command was run.

## Safe deployment sequence after blockers clear

1. Create a versioned release from a clean reviewed commit and record its SHA.
2. Configure production secrets and confirm production/debug, HTTPS URLs/origins, secure cookies, MySQL, Redis, mail, rate limits, retention, and proxies.
3. Back up MySQL and restore it into an isolated database; validate critical row counts/checksums.
4. Rehearse pending migrations on that clone and measure both MySQL `ALTER TABLE` locks.
5. Build on PHP 8.3 and Node 22.22.2 and rerun all gates.
6. Upload the versioned release and wire only approved shared environment/storage.
7. Run `php artisan migrate --force`, then `config:cache`, `route:cache`, and `view:cache`.
8. Restart Nuxt atomically; run `php artisan queue:restart`; reload PHP-FPM/Nginx only after `nginx -t`.
9. Run health and real short-link/analytics smoke tests, then disable the test resource.
10. Review Laravel, Nuxt, Nginx, queue, Redis, and database logs.

## Rollback procedure

1. Point traffic/current-release symlink back to the recorded previous release.
2. Restore the previous Nuxt/PHP code and rebuild Laravel config/route/view caches from it.
3. Run `php artisan queue:restart` so workers load compatible previous code.
4. Validate `nginx -t`, reload Nginx, and smoke-test `/`, `/up`, authentication, and a redirect.
5. Do **not** automatically run `migrate:rollback` in production. Determine migration compatibility first; use the verified backup and an approved restore/cutover if schema recovery is required.
6. Invalidate only affected short-link keys; do not flush unrelated shared Redis data.

## Temporary local artifacts

Isolated SQLite files were created only under the Windows temp directory. The browser database was `C:\Users\Fahim TR\AppData\Local\Temp\247url-browser-dc675bcbbf5d44fa97cb9fdf7a67b688.sqlite`; its test link was disabled and it was never production data.
