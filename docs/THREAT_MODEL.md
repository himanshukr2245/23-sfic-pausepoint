# THREAT MODEL — PausePoint (updated 2026-10-07)
## 1. Assets
Users' notes (auth module) · the Supabase project and its keys · the Cloudflare account · the template's reputation (every new app inherits its defaults).
## 2. Actors
Curious users · scraper and credential-stuffing bots · someone abusing the public telemetry endpoint · a malicious dependency.
## 3. Entry points
Every page (HTML) · `/about` Server Action · `/api/log` · `/api/health` · auth routes and email links (auth module) · the service worker (offline module) · CI and the npm dependency tree.
## 4. Top threats (likelihood / impact)
| Threat | L | I | Control (layer) | Proof |
|---|---|---|---|---|
| XSS through rendered content | M | H | React escaping, nonce CSP (SEC-6) | csp.spec, check-live |
| Secret committed to git | M | H | pre-commit hook, check-secrets, push protection (SEC-1) | hook blocked a fake key in S0 |
| User B reads user A's notes | M | H | RLS per command, user-session client (SEC-4) | rls-proof (S4) |
| `/api/log` flooded or used to inject data | M | L | size cap, server-side allow-list, WAF rate rule (SEC-5, OPS-2) | unit tests; WAF rule in S6 |
| Credential stuffing / brute force on sign-in | M | H | auth calls from the browser so Supabase per-IP limits apply; enumeration-safe messages; Turnstile + WAF rule optional (SEC-3, SEC-5) | auth spec (guest), real-account test (S6) |
| A stale offline edit overwrites a newer one | M | M | server-side last-write-wins trigger, unsent-local-wins pull (OFF-2) | synced-store unit suite |
| One person sees another's notes on a shared phone | M | H | one device database per person, full reload on sign-in/out, anonymous service-worker precache | device-store + synced-store tests |
| Email link burnt by a mail scanner / open redirect via `next` | M | M | tap-to-confirm page, safeNext() (no //, no backslash, no /auth loops) | auth unit tests |
| Vulnerable dependency | M | M | npm audit in check:release, sharp override (SEC-9) | `npm audit --omit=dev` clean |
## 5–6. Controls and proofs
See the table; every control maps to a gate in the ladder (BLD-7).
## 7. Accepted risks
The UI bundle is public by design · per-isolate rate limiting on `/api/log` is only a soft brake until the WAF rule exists · free Supabase project pauses after a week without the keep-awake ping.
