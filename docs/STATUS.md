# STATUS — HK Starter
Updated: 2026-10-07 by Claude (with Himanshu) · Phase: S5 hk:init + template CI — done; next S6 live proof with your Supabase project
Live: https://starter.hkr.dpdns.org (S3 deployed; verify the latest push with `check:live --expect-head`) · Last green tag: s5

## Done
- S0 scaffold: Next 16.3.8 + OpenNext 1.20.8, HK_KIT gates + pre-commit hook, gate ladder, pinned deps, `.nvmrc` 24.
- S1 core shell: tokens + themes, layout with per-request nonce CSP, Top Loader, network banner, header/footer, error/loading/not-found pages, `/api/health`, `/api/log` + telemetry client, robots/sitemap/OG, unit + e2e tests.

- S2 notes: `NotesStore` contract (one shared test suite every store must pass), IndexedDB device store (one database per person, versioned upgrades, "reload" when a newer tab upgrades, row + sync queue in one transaction, other tabs update live), `/notes` screen with designed loading / empty / error / saving states, golden path beat 4 + notes e2e (phone + laptop).
- S3 offline shell: hand-written `public/sw.js` (anonymous, redirect-free precache of `/`, `/notes`, `/offline` + their scripts; network-first pages with a 4 s limit → saved page → `/offline`; cache-first hashed files; never `/api`, `/auth`, RSC or non-GET), polite update prompt, installable manifest + icons, `/offline` page, storage persistence after the first note, offline e2e that proves the reload came from the cache.
- S4 auth + sync: Supabase clients (browser auth calls — per-IP rate limits work), session refresh in the middleware that keeps the nonce and the no-store headers, sign in / create account / forgot / email-link confirm (tap to use) / new password / account (change password, sign out, delete everything), header account button; account store (Server Actions + RLS) and synced store (device first, outbox push compare-and-set, pull by server clock with overlap, tombstones, server-side last write wins, per-person databases, guest notes moved only on request) — both pass the shared store contract; migrations, branded email templates, keep-awake workflow, deep health checks the database. Guest mode until Supabase is configured.
- S5 hk:init: `npm run hk:init -- --name … --slug … --domain … --modules …` (markers in 8 allow-listed files, variants, manifest, renames incl. database prefix, fresh README/STATUS/DECISIONS, lockfile rewritten with npm 10.9.2, deletes itself); `--check` validates the template; the `template` workflow initialises all 4 combinations and runs `npm run check` on each. Proven locally from fresh clones: all 4 combinations pass types, lint, unit tests, build, check-dynamic and check-rls; `none` also passes the full e2e suite.

## Live proof (2026-10-07)
- `check-live --expect-head` clean on https://starter.hkr.dpdns.org; 32/32 e2e tests pass against the live Cloudflare runtime; worker 1.23 MB gzip.

## Next
- GitHub: tick Settings → General → **Template repository** so "Use this template" appears.
- S6 (with you): docs/SUPABASE_SETUP.md → real-account e2e + rls-proof against the live site → v1.0.0. · S5: hk:init + CI matrix · S6: live proof + v1.0.0.

## Known bugs
- The notes e2e suite times out when repeated 3× in parallel on the 8-thread laptop (single full runs pass); measured idle pages at ~60 frames/s, so the cause is not idle animation — investigate in v4 Phase 5 with real numbers.
- none known (the transient e2e failures of 2026-10-07 were explained and fixed: a test sampling 0.5 s UI, and 4 browsers overloading the laptop — HK ledger F-63, F-64)

## Fixed on 2026-10-07 (from the first deploy attempt)
- Workers Builds `npm ci` failed: lockfile written by npm 11; Cloudflare uses npm 10.9.2 → regenerated + verify-lock gate.
- Top Loader never appeared on <Link> clicks or Back → started from onRouterTransitionStart + 300 ms minimum display.
- Second Workers Builds attempt: `Cannot find package 'esbuild'` (OpenNext imports esbuild without declaring it) → esbuild declared as a devDependency; real OpenNext build verified locally; worker 1.23 MB gzip.

## Simulated (must be labelled in UI + docs)
- none

## Cut list
- `/hk-admin` and Android are not pre-wired (per app via SEC-12 / STK-10).
