# PausePoint

PausePoint — built from pausepoint.

- **Live:** https://pausepoint.hkr.dpdns.org
- **Built from:** pausepoint (modules: offline) · house standard: HK Universal Library v3 (`2-Plans/universal/00_START_HERE.md`)
- **Status:** `docs/STATUS.md` · **AI brain:** `AGENTS.md`

## Daily work
1. `npm run dev` — opens http://127.0.0.1:3000 (you run it; it is not started for you).
2. `npm run check:fast` after every change; `npm run check` before you push.
3. Deploy = `git push` → Cloudflare Workers Builds. Never `npm run deploy` from Windows.

## First deploy
1. Publish the repository to GitHub (GitHub Desktop → Publish repository).
2. Cloudflare → Workers & Pages → Create → Import a repository → this repo · build command `npx opennextjs-cloudflare build` · deploy command `npx wrangler deploy` · root `/`.
3. The Worker → Settings → Domains & Routes → Add → Custom domain → `pausepoint.hkr.dpdns.org`.
4. Build variable `NEXT_PUBLIC_SITE_URL` = `https://pausepoint.hkr.dpdns.org`.
5. `npm run check:live -- https://pausepoint.hkr.dpdns.org --expect-head` — green means the live site runs your commit and passes the security checks.

## The gate ladder
| Command | When | Checks |
|---|---|---|
| `npm run check:fast` | after every task | route types + `tsc`, ESLint, secrets, design tokens |
| `npm run check` | end of every phase | fast + RLS, honesty, assets, unit tests, build, dynamic rendering, end-to-end tests |
| `npm run check:release` | before a release | check + dependency audit, bundle leaks, route weight, deploy preflight, FACTS |
| `npm run check:live -- <url> --expect-head` | after every deploy | the live site runs your commit · headers, nonce CSP, health, hidden paths, smoke routes |
