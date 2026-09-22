# API

The authoritative OpenAPI 3.1 document is [`backend/public/openapi.yaml`](backend/public/openapi.yaml). In production it can be served from `https://api.example.com/openapi.yaml` and imported into Swagger UI, Redoc, Postman, or an SDK generator.

All application endpoints are versioned below `/api/v1`. Authenticated calls use:

```http
Authorization: Bearer <sanctum-token>
Accept: application/json
```

Successful mutation responses use `{ "data": ..., "message": "..." }`. Laravel validation responses use status `422` with `message` and field-keyed `errors`. `401`, `403`, `404`, `410`, and `429` retain their standard meanings.

Core resources:

- `POST /auth/register`, `/auth/login`, `/auth/logout`
- `POST /auth/forgot-password`, `/auth/reset-password`
- `GET /auth/me`
- `POST /links` (anonymous when enabled; authenticated requests create an owned link)
- `GET /links`
- `GET|PATCH|DELETE /links/{id}`
- `GET /analytics?period=7d|30d|90d` (account-wide owned-link aggregates)
- `GET /links/{id}/analytics?period=7d|30d|90d`
- `GET /links/{id}/qr`
- `PATCH /profile`, `PUT /profile/password`
- `GET|POST /api-tokens`, `DELETE /api-tokens/{id}`
- `POST /abuse-reports`

Admin-only routes live under `/api/v1/admin` and require both Sanctum authentication and the `admin` role.

Browser traffic uses the public Laravel API base and the API's existing expiring Sanctum bearer-token contract. The Nuxt client stores the current login token in a Secure, SameSite=Strict first-party cookie and sends it only as an `Authorization: Bearer` header to the configured API origin. Integration tokens use `links:read`, `links:write`, and `analytics:read` only; those scoped tokens cannot manage profile credentials, mint more tokens, or access administration. Production CORS must list exact frontend origins and must not use a wildcard when credentials are enabled.
