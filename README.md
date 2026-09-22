# 247URL

Production-oriented URL shortening SaaS foundation built with Nuxt 3, Vue 3, TypeScript, Tailwind CSS, Laravel 12, Sanctum, MySQL 8, and Redis.

## Requirements

- Docker 24+ and Docker Compose v2 (recommended), or
- PHP 8.3+, Composer 2, MySQL 8, Redis 7, Node.js 22.22+, and npm 10+

## Repository

```text
frontend/       Nuxt SSR website, direct API client, auth and dashboard UI
backend/        Laravel API, redirects, jobs and scheduler
deploy/nginx/   local and production Nginx examples
docker-compose.yml
ARCHITECTURE.md
API.md
SECURITY.md
```

The implemented UI follows the light 247URL design source in `Design Inspiration/`; route-by-route references, API contracts, truthful feature boundaries, and responsive behavior are recorded in `DESIGN_TO_CODE.md`.

## Docker development

1. Copy `.env.example` to `.env`, `backend/.env.example` to `backend/.env`, and `frontend/.env.example` to `frontend/.env`.
2. In `backend/.env`, set `DB_HOST=mysql`, `REDIS_HOST=redis`, `APP_URL=http://localhost`, `FRONTEND_URL=http://localhost`, `SHORT_URL_DOMAIN=http://localhost`, then generate an application key:

   ```bash
   docker compose build backend
   docker compose run --rm backend php artisan key:generate --show
   ```

   Put the printed value in `backend/.env` as `APP_KEY`.

3. Start services and migrate:

   ```bash
   docker compose up -d --build
   docker compose exec backend php artisan migrate --seed
   ```

4. Open `http://localhost`. The seeded account is `demo@example.com`; set a password through a local reset flow or create a new account. Mail uses the log driver by default (`backend/storage/logs/laravel.log`).

Queue and scheduler are separate Compose services. Inspect them with `docker compose logs -f queue scheduler`.

## Native development

Backend:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
php artisan queue:work redis --queue=default,analytics --tries=3
php artisan schedule:work
```

Frontend, in another terminal:

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev
```

For a lightweight backend test environment, set `DB_CONNECTION=sqlite`, create `backend/database/database.sqlite`, and use `CACHE_STORE=array`, `QUEUE_CONNECTION=sync`.

## Validation

```bash
cd backend
php artisan migrate:fresh --seed
php artisan test
./vendor/bin/pint --test

cd ../frontend
npm audit
npm run test
npm run typecheck
npm run lint
npm run build
```

End-to-end strategy: use Playwright against the Compose stack to register and verify a test user, create random/custom links, follow redirects, disable/expire links, run the analytics worker, verify chart data, download an SVG QR code, exercise throttling, and test keyboard navigation at mobile and desktop viewports. External email delivery and GeoIP headers require environment-specific integration tests.

Redirect micro-benchmark (run against a disposable/local link; it does not follow the destination):

```bash
php backend/scripts/benchmark-redirect.php http://127.0.0.1:8000/TestCode 200
```

Run one request after clearing `short-link:TestCode` to observe a cache miss, then repeat for cache hits. To exercise database fallback, point a local test process at an unavailable Redis endpoint. Results are environment-specific latency samples, not production throughput claims.

## Production deployment

1. **DNS and TLS:** point `example.com` and `api.example.com` to the server. Optionally point a separate short domain to the same redirect Nginx block. Issue certificates with Certbot or your managed edge and enable renewal.
2. **Runtime:** install Nginx, PHP 8.3 FPM with `intl`, `pdo_mysql`, `pcntl`, `bcmath`, `opcache`, and XML extensions, MySQL 8, Redis 7, Node 22, Composer, and Supervisor or systemd.
3. **Release:** deploy to a versioned release directory, run `composer install --no-dev --classmap-authoritative`, `npm ci`, and `npm run build`. Symlink only `backend/storage` and environment files as shared state.
4. **Laravel:** set `APP_ENV=production`, `APP_DEBUG=false`, production URLs, MySQL with binary short-code collation, Redis cache/queue, real SMTP, exact CORS origins, a dedicated analytics hash key, trusted proxies/geo policy, secure sessions, retention, rate limits, and reserved aliases. Run `php artisan migrate --force`, then `php artisan config:cache`, `route:cache`, and `view:cache`.
5. **Nuxt:** run `.output/server/index.mjs` as a restricted systemd user with `NODE_ENV=production`, `HOST=127.0.0.1`, `PORT=3000`, `NUXT_API_BASE`, `NUXT_PUBLIC_API_BASE`, public site URL, and short domain. Restart it atomically after each release.
6. **Nginx:** adapt `deploy/nginx/production.conf.example`. Exact public routes go to Nuxt; a constrained single-segment code route goes directly to Laravel; API traffic uses the API virtual host. Replace domains and PHP socket paths.
7. **Workers:** run at least one `php artisan queue:work redis --queue=default,analytics --sleep=1 --tries=3 --timeout=60` process under Supervisor/systemd. Use `php artisan queue:restart` during deploys. Add one cron entry: `* * * * * cd /var/www/247url/backend && php artisan schedule:run >> /dev/null 2>&1`.
8. **Operations:** make `storage` and `bootstrap/cache` writable by the PHP user, configure log rotation, monitor `/up`, queue failures and latency, back up MySQL, test restores, and deploy Sentry/OpenTelemetry only when configured. Telescope should remain development-only.

Never run seeders in production unless their exact effect has been reviewed. Back up before schema changes and use maintenance mode for non-compatible migrations.

Required manual production values include `APP_KEY`, `APP_URL`, `FRONTEND_URL`, `SHORT_URL_DOMAIN`, all `DB_*`, Redis host/password/TLS settings supported by the environment, `CORS_ALLOWED_ORIGINS`, `TRUSTED_PROXIES`, `ANALYTICS_HASH_KEY`, SMTP credentials/from address, every `RATE_LIMIT_*`, retention/location/geo choices, blocked/reserved domains, and both Nuxt API base variables plus public URLs. The browser uses the API's existing Sanctum bearer-token contract; `SANCTUM_STATEFUL_DOMAINS` and Laravel session-cookie settings matter only if that backend is later changed to cookie-based SPA authentication. Do not set `DEMO_USER_PASSWORD` or run the development seeder in production.

## Key decisions

- Short codes are case-sensitive base58 and never expose sequential IDs.
- `302 Found` supports editable destinations; short-link pages are not indexable content.
- Redis cache TTL defaults to one hour, with immediate invalidation on mutations.
- Raw click events default to 90-day retention; daily aggregates remain for charts.
- Anonymous shortening, location storage, domains, limits, aliases, retention, and code length are environment-driven.

See [ARCHITECTURE.md](ARCHITECTURE.md), [API.md](API.md), and [SECURITY.md](SECURITY.md) for implementation detail.
