# FACTS (auto-generated — do not edit)
> Generated 2026-10-19T04:39:57.029Z from commit `536913f` by `npm run facts`.
> Quote these numbers exactly. Anything not listed here is an ASSUMPTION and must say so.

| Fact | Value |
|---|---|
| Page routes | 13 |
| API routes | 2 |
| Test files / test cases (static count) | 21 / 135 |
| Source files / lines in src | 143 / 22386 |
| Database tables (from migrations) | 0 |
| Total dependencies | 22 |
| HK gates passing (last recorded run) | 15/15 |
| next | 16.3.8 |
| react | 19.2.8 |
| typescript | ^5 |
| tailwindcss | ^4 |
| @opennextjs/cloudflare | 1.20.8 |
| wrangler | ^4.147.0 |
| idb | ^8.0.4 |
| zod | ^4.6.5 |
| vitest | ^5.0.3 |
| @playwright/test | ^1.63.0 |

## Page routes
- `/`
- `/about`
- `/ai`
- `/design`
- `/editorial`
- `/notes`
- `/offline`
- `/report`
- `/settings`
- `/showcase`
- `/studio`
- `/support`
- `/verify`

## API routes
- `/api/health`
- `/api/log`

## HK Gate Scorecard
> From `.hk/gates.json` — the last recorded result of each gate on this machine. Re-run the gates before quoting it.

| Pillar | Passed | Last run |
|---|---|---|
| BLD | 2/2 | 2026-10-19T04:34:08.888Z |
| STK | 2/2 | 2026-10-18T18:42:17.064Z |
| SEC | 6/6 | 2026-10-19T04:34:39.176Z |
| PRF | 4/4 | 2026-10-19T04:34:09.229Z |
| OPS | 1/1 | 2026-10-13T19:20:31.668Z |
| **Total** | **15/15** | 2026-10-19T04:34:39.176Z |

| Gate | Rule | Result | Problems | Warnings | Last run |
|---|---|---|---|---|---|
| check-honesty | BLD-10 | ✅ pass | 0 | 0 | 2026-10-19T04:34:08.888Z |
| check-tokens | BLD-4 | ✅ pass | 0 | 14 | 2026-10-19T04:34:08.575Z |
| check-live | OPS-4/SEC-6/SEC-12 | ✅ pass | 0 | 0 | 2026-10-13T19:20:31.668Z |
| check-chunks | PRF-1 | ✅ pass | 0 | 0 | 2026-10-18T21:10:57.842Z |
| check-weight | PRF-1 | ✅ pass | 0 | 0 | 2026-10-18T21:10:47.392Z |
| check-assets | PRF-3 | ✅ pass | 0 | 0 | 2026-10-19T04:34:09.229Z |
| check-licences | PRF-4 | ✅ pass | 0 | 2 | 2026-10-18T21:11:30.835Z |
| check-secrets | SEC-1 | ✅ pass | 0 | 0 | 2026-10-19T04:34:08.403Z |
| check-secrets (staged) | SEC-1 | ✅ pass | 0 | 0 | 2026-10-18T18:58:28.038Z |
| hk-seal verify | SEC-13 | ✅ pass | 0 | 0 | 2026-10-18T21:12:08.785Z |
| check-bundle | SEC-2 | ✅ pass | 0 | 0 | 2026-10-18T21:10:01.899Z |
| check-rls | SEC-4 | ✅ pass | 0 | 1 | 2026-10-18T12:53:23.073Z |
| check-dynamic | SEC-6 | ✅ pass | 0 | 0 | 2026-10-19T04:34:39.176Z |
| check-opennext | STK-3 | ✅ pass | 0 | 2 | 2026-10-18T18:42:17.064Z |
| verify-lock | STK-3 | ✅ pass | 0 | 0 | 2026-10-18T15:58:27.708Z |
