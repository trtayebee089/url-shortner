# Security model

## Implemented controls

- Strict HTTP/HTTPS URL validation rejects dangerous schemes, malformed hosts, control characters, and embedded credentials. Query strings, fragments, and encoded paths are preserved.
- The service never fetches submitted destinations. The safety provider performs string/domain policy checks only, eliminating a server-side request forgery path in normal shortening.
- Configurable blocked domains, reserved aliases, anonymous creation, rate limits, retention, and optional location storage.
- Database-enforced unique short codes plus retry-on-constraint collision handling.
- Sanctum bearer authentication, email verification, active-account middleware, ownership policies, ability-scoped admin/account routes, expiring tokens, password rules, and token revocation on reset.
- Nuxt uses the Laravel API's existing bearer-token authentication contract. The browser keeps the current token in a Secure, SameSite=Strict first-party cookie and the centralized API client sends it only in an `Authorization` header to `NUXT_PUBLIC_API_BASE`. The CSP `connect-src` directive is derived from that configured API origin.
- CORS allowlists origins and headers. Laravel emits anti-framing, MIME sniffing, referrer, and permissions headers. Nginx production guidance adds HSTS.
- Eloquent/query bindings prevent SQL injection; Vue escapes interpolated content; error responses do not expose production stack traces.
- Resource articles are typed local data rendered as Vue text nodes. The frontend does not render user-controlled HTML, link titles, descriptions, tags, or resource copy through `v-html`.
- Raw IP addresses are transformed into daily HMAC visitor hashes before queueing. Queue payloads contain no raw IP.
- Analytics dispatch failures are logged and never block a valid redirect. Unique event IDs make worker retries idempotent; daily visitor uniqueness is database-enforced.

## Operational requirements

1. Set `APP_ENV=production`, `APP_DEBUG=false`, a generated `APP_KEY`, unique database/Redis credentials, HTTPS URLs, and exact CORS origins.
2. Replace placeholder support/abuse addresses and have counsel review terms/privacy text.
3. Protect Redis and MySQL on private networks; require authentication where appropriate; never expose them publicly.
4. Run dependency audits, rotate secrets, back up MySQL, test restores, centralize logs, and alert on queue failures, high 4xx/5xx rates, and abnormal creation traffic.
5. Put bot challenges at the edge for suspicious anonymous creation rather than embedding a mandatory paid provider.
6. Add a malware provider behind `UrlSafetyProvider` only if required. It must resolve and block private/link-local address ranges, limit redirects, use strict timeouts, and run asynchronously in an isolated network policy.
7. If trusted geo headers are enabled, configure the public proxy to delete inbound client copies and inject authoritative values. Never enable `TRUSTED_PROXIES=*` on a directly reachable application port.
8. The supplied CSP deliberately permits inline Nuxt script/style execution. Replacing it with nonce-based CSP is a future hardening option and must be integration-tested before enforcement.

The legal pages are operational templates, not a claim of GDPR, CCPA, or other regulatory compliance. Before launch, replace the organization, jurisdiction, retention, contact, cookie, terms, privacy, and abuse-response placeholders and obtain appropriate legal review.

## Reporting

The public abuse endpoint accepts a short code, categorized reason, optional email, and details. Admin APIs can inspect reports and disable links. Define an incident-response owner and response target before launch.

## Supported disclosure

Do not include secrets or live exploit payloads in public issues. Send reports to the production security contact configured by the operator.
