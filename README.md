# HK Starter

The pre-wired template for every new app: Next.js 16 on Cloudflare Workers (OpenNext), with the HK Universal Library's gates, security defaults and tests already in place.

- **Live proof:** https://starter.hkr.dpdns.org
- **House standard:** `2-Plans/universal/00_START_HERE.md` (HK Universal Library v3)
- **Status:** `docs/STATUS.md`

## Start a new app from this template (about 15 minutes)
1. GitHub → this repository → **Use this template** → Create a new repository (private) → clone it with GitHub Desktop.
2. In the new folder: `npm install` (also switches on the pre-commit secret scan).
3. Preview what will change, then do it:
   - `npm run hk:init -- --name "My App" --slug my-app --domain myapp.example.com --modules auth,offline --dry-run`
   - the same without `--dry-run` → answer `yes`
   - add `--brand "#0ea5e9"` to give the app its own colour (light + dark tokens, contrast-checked); hk:init also writes `docs/IDEA.md` (fill it in) and `docs/KICKOFF_PROMPT.md` (paste it to your AI)
   - `--modules`: `none` (core only) · `auth` (accounts, notes in the account) · `offline` (installable, notes on the device) · `auth,offline` (both, synced)
4. `npm run check` → commit ("chore: init my-app from hk-starter") → push.
5. Follow **First deploy** in the new README that hk:init wrote (Cloudflare Workers Builds + your domain); with `auth`, also `docs/SUPABASE_SETUP.md`.

hk:init renames the app (name, slug, domain, database prefix), removes the modules you did not choose (files, packages, tests, smoke paths), writes a fresh README / STATUS / DECISIONS, rewrites the lockfile with the deploy's npm, and deletes itself — it runs once. The `template` workflow proves all four module combinations initialise and pass `npm run check` on every push.

## Daily work (this template)
1. `npm run dev` — opens http://127.0.0.1:3000.
2. `npm run check:fast` after every change; `npm run check` before you push.
3. Deploy by `git push` → Cloudflare Workers Builds (build `npx opennextjs-cloudflare build`, deploy `npx wrangler deploy`). Never deploy from Windows.

## The gate ladder
| Command | When | Checks |
|---|---|---|
| `npm run check:fast` | after every task | route types + `tsc`, ESLint, secrets, design tokens |
| `npm run check` | end of every phase | fast + RLS, honesty, assets, unit tests, build, dynamic rendering, end-to-end tests |
| `npm run check:release` | before a release | check + dependency audit, bundle leaks, route weight, deploy preflight, FACTS |
| `npm run check:live -- <url> --expect-head` | after every deploy | the live site runs your commit · headers, nonce CSP, health, hidden paths, smoke routes |

## Modules in this template
- **offline** — installable app, service worker (pages open with no network), notes in IndexedDB.
- **auth** — Supabase accounts (sign in, email links from your domain, account page, delete everything). Guest mode until you follow `docs/SUPABASE_SETUP.md`.
- **both** — notes saved on the device first, then synced to the account (last write wins, enforced in the database).

## Licence
© 2026 Himanshu Kumar. All rights reserved.
