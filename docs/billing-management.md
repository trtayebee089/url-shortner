# Administration and billing

The superadmin workspace is `/admin`, using the existing Sanctum bearer-token authentication. Only active, verified `superadmin` accounts with the `admin` token ability (or the normal web token's `*`) can access management APIs. Ordinary `admin` accounts retain moderation access but cannot manage billing. Public registration cannot assign roles.

## Owner setup

Run on the Laravel host:

```sh
php artisan migrate --force
php artisan optimize
php artisan admin:provision OWNER_EMAIL --create --send-reset
```

There is no default password. An existing account retains its password. New accounts receive a random unknown password and use the normal password-reset email flow. Console provisioning explicitly verifies the owner email and records an audit entry. Subsequent sign-in through password or configured Google OAuth opens the admin workspace. SMTP must work to deliver the reset email; otherwise use the normal Forgot password page after repairing mail configuration.

## Plans and subscriptions

Plans own public descriptions, prices, currency, feature copy, total link limits, visibility and Stripe Price mappings. Amounts are stored as integer minor units; the UI accepts normal currency amounts. Blank prices mean a custom agreement. Free is the default fallback, cannot be archived or charged, and initially retains unlimited links to preserve existing usage. New limits apply when creating links; existing links and redirects remain intact. Feature copy describes the offer; this release enforces total link count, not arbitrary feature text.

Manual agreements have explicit dates and immutable agreed price snapshots. Overlapping agreements are rejected. Scheduled, expired and cancelled subscriptions are derived at read time, so expiration does not depend on a running scheduler. Cancelling a manual agreement revokes its plan immediately and retains its history; no refund is issued. Manual payment references are unique, recorded payments can be voided but not deleted, and payment recording does not automatically activate a subscription. Stripe-managed subscriptions cannot be cancelled or recorded as manual payments through the manual API.

Customer suspension revokes existing tokens and blocks further authentication. It does not delete links or charge/cancel a Stripe subscription. Administrator roles and credentials cannot be changed through customer forms. The audit log records management changes without passwords, access tokens or Stripe secrets. System operations have a null actor.

## Stripe activation (disabled in this release)

Use the Stripe account's **test mode first**. Put these values only in Laravel's server environment:

```dotenv
STRIPE_ENABLED=false
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=
```

Create an HTTPS webhook endpoint at `https://api.247.bd/api/v1/billing/stripe/webhook`, subscribed to `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`. Set the endpoint API version to `2025-02-24.acacia`, matching the API client. Store its signing secret as `STRIPE_WEBHOOK_SECRET`. Enable and configure Stripe's customer portal (payment methods, invoices and cancellation); configure plan changes there only after mapping all supported recurring prices in 247URL. Do not enable quantities or multi-product subscriptions: this release supports one product with quantity one.

Set `STRIPE_ENABLED=true`, run `php artisan optimize`, then link monthly/yearly recurring Price IDs in Admin → Plans. Price currency, amount and recurring interval must match the plan and are verified against Stripe before saving. Do not use one Price ID in both billing intervals. Existing Stripe amounts remain authoritative after changes to the public plan.

Checkout prices, account ownership, success/return URLs and customer IDs come from the server. A browser redirect never grants access. Signed raw-body webhooks retrieve the current Stripe subscription under a customer lock, preventing old deliveries from overwriting newer state. Event IDs are deduplicated in the database; failed transactions remain retryable. Signatures expire after five minutes. Active/trialing periods grant plan access; expired, unpaid and past-due subscriptions fall back to Free. Cancellation at period end retains access until the confirmed period ends. Stripe's portal owns Stripe invoices and refunds; the manual payment ledger does not duplicate them.

Checkout uses per-customer locking and durable idempotency keys. Unfinished checkout sessions must expire before choosing a different plan. If a customer already has a Stripe subscription, they are directed to billing management instead of being charged for a second subscription.

Local webhook testing:

```sh
stripe listen --forward-to localhost:8000/api/v1/billing/stripe/webhook
```

Use the CLI's test signing secret locally. Test Checkout success, cancellation, repeated requests, duplicate/out-of-order webhook events, payment failures, cancellation at period end, and portal changes before switching to live keys. Configure live Price IDs and the live webhook signing secret separately. Never paste keys into chat or commit them.

## Verification and deployment

```sh
cd backend
php artisan config:clear
php artisan route:clear
php vendor/bin/phpunit
php vendor/bin/pint --test
cd ../frontend
npm test
npm run lint
npm run build
```

The Hostinger release runner `deploy/billing-release.php` is CLI-only, validates the exact API installation, takes a MySQL schema/data snapshot outside the public web root, backs up changed code, installs only files from its manifest, migrates, rebuilds caches and provisions the owner without printing a password. Existing `.env`, vendor packages, storage and unrelated sites are preserved. Keep the backup directory private. The runner does not automatically roll back additive schema changes. Restore code from the backup only after evaluating schema compatibility; never drop billing tables with real records.

The shell entry point runs Artisan commands directly because Hostinger disables PHP process-execution functions. The release branch excludes the credential JSON from the separate local-only commit. The frontend's short-code redirect middleware must exclude `admin` so a direct visit or reload stays in Nuxt. Private-page headers are applied to normalized paths as well as Nuxt route rules.

The October 31 dependency refresh removes all reported high/critical npm advisories without a Nuxt major-version upgrade or forced peer dependencies. The remaining audit findings are 43 moderate and 2 low in the existing framework/tooling dependency tree. Some have no available fix; the suggested framework upgrade requires a separate Nuxt migration. Do not run `npm audit fix --force` or `--legacy-peer-deps` to silence them.
