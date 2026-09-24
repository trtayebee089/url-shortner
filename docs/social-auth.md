# Google and Apple sign-in

247URL continues to use its existing Sanctum bearer-token login. Laravel Socialite verifies the provider callback and associates its provider ID with a local user. The browser then exchanges a five-minute, single-use ticket plus an HttpOnly browser cookie for the same `data.user` and `data.token` response shape as email/password login. Provider access and refresh tokens are never stored or sent to Nuxt.

## Laravel environment

Set these on the Laravel API host, not as `NUXT_PUBLIC_*` values:

| Provider | Required environment variables |
| --- | --- |
| Google | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` |
| Apple | `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY_PATH`, `APPLE_REDIRECT_URI` |

`APPLE_PRIVATE_KEY_PATH` is an absolute path to a readable `.p8` key stored outside the repository and public web root. The Apple Socialite provider signs a short-lived client-secret JWT from this key. Keep the key and all provider credentials in the hosting secret environment. Keep `FRONTEND_URL` set to the Nuxt origin, `CACHE_STORE` on a shared persistent store such as Redis, `CORS_ALLOWED_ORIGINS` restricted to the Nuxt origin, and the production API on HTTPS. No new Sanctum cookie/session configuration is needed for this bearer-token flow.

Run the `social_accounts` migration before enabling the social buttons against a deployed backend. Deploy the frontend and API together so the exchange route and handoff page are both available.

## Provider consoles

For production, register the Google **Web application** redirect URI exactly as `https://api.247.bd/api/v1/auth/google/callback` and its JavaScript origin as `https://247.bd`. Configure the OAuth consent screen and request access to basic `openid`, `profile`, and `email` scopes. Set `GOOGLE_REDIRECT_URI` to that same callback.

For Apple, create a Sign in with Apple-enabled primary App ID, a web **Services ID** (`APPLE_CLIENT_ID`), and a Sign in with Apple key. Associate the Services ID with the website domain and register `https://api.247.bd/api/v1/auth/apple/callback` as its return URL. Set the Apple Team ID and key ID, put the downloaded `.p8` file on the API host, and set `APPLE_PRIVATE_KEY_PATH` to its absolute path. The provider requests name and email, accepts Apple's `form_post` callback, verifies its signed identity token and nonce, and works with private relay addresses. Configure Apple's private email relay domain and sender registration if 247URL must send verification or password-reset mail to relay addresses.

## Local development

Google can use `http://localhost:8000/api/v1/auth/google/callback` with `GOOGLE_REDIRECT_URI` set identically and Nuxt at `http://localhost:3000`. Start both services on those exact origins.

Apple does not accept `localhost`, IP addresses, or HTTP redirect URLs for web sign-in. Use an HTTPS development domain or tunnel that reaches the local Laravel API, register its exact `/api/v1/auth/apple/callback` URL and domain in Apple Developer, and point `APPLE_REDIRECT_URI` to it. Use separate development provider credentials and a development `.p8` key. The Apple nonce/state cookies require HTTPS.

## Account behavior

The first sign-in requires a provider-verified email. An existing user with the same email is linked to the provider ID; a new user receives a random, unknown password hash and a verified email timestamp. Later Apple sign-ins find the stored provider ID even when Apple omits the name or email. Disabled accounts cannot sign in. A provider identity with no verified email cannot create or link an account. Password reset remains available for social-only users through their email address.

## Manual release check

With both providers configured and the migration applied, test each provider from login and registration through authorization, callback, `/dashboard`, link creation, account ownership, logout, and returning sign-in. Also test cancellation, a mismatched/expired state, and a second Apple sign-in where Apple omits the name. Live provider sign-in requires credentials and cannot be proven by the mocked tests.
