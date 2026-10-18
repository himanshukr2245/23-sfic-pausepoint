<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — HK Starter project brain
> Loaded every session (Claude Code reads it through CLAUDE.md). If this file and any other doc disagree, STOP and ask the human.
> House standard: `2-Plans/universal/00_START_HERE.md` in the workspace (HK Universal Library v3) — its 12 laws override everything here. Load only the library sections the AI load map names for the task.

## Mission
The pre-wired template every new app starts from: "Use this template → `npm run hk:init` → push → connect Workers Builds", live in ~15 minutes, already passing the gate ladder.
Kind: PRODUCT (a template) · Security level: Real · Offline claimed: only when the `offline` module is on · `/hk-admin`: not pre-wired (add per app via SEC-12).
Live proof: https://starter.hkr.dpdns.org · Status: `docs/STATUS.md`.

## Stack (pinned — do not upgrade without asking)
next 16.3.8 (security floor 16.3.8) · react 19.2 · @opennextjs/cloudflare 1.20.8 · wrangler 4 · tailwindcss 4 (`@theme` tokens in `src/app/globals.css`, no config file) · zod 4 · @supabase/ssr + supabase-js (auth module) · idb (offline module) · vitest 5 · @playwright/test + @axe-core/playwright
Hosting: Cloudflare Workers via OpenNext · Edge gate: `src/middleware.ts` (Next 16's proxy.ts is experimental on OpenNext) · Node 24 (`.nvmrc`)

## Folder map
src/app (routes; `notes`, `api/health`, `api/log`) · src/components (shell, toggles, ErrorBoundary) · src/lib (site, theme, preferences, zod, navigation = Top Loader, telemetry, notes = model + store contract + active store, sync/uid)
src/modules/<module> (self-contained): offline = device db + store, sync/outbox, pwa registrar · auth = supabase clients, session refresh, forms, server store, ui · synced (auth AND offline) = sync engine, transport, synced store · public/sw.js (offline shell) · supabase/ (migrations, email templates) · docs/SUPABASE_SETUP.md · scripts (HK_KIT gates — never edit here; change HK_KIT and re-sync) · e2e (Playwright) · docs

## Commands (the gate ladder)
npm run dev (127.0.0.1 only) · npm run check:fast (after every task) · npm run check (end of phase: + build, check-dynamic, Playwright) · npm run check:release (freeze) · npm run check:live -- <url> (after every deploy) · npm run facts
Deploy = git push → Cloudflare Workers Builds (Linux). NEVER `npm run deploy` / `wrangler deploy` from Windows — it uploads, then 500s at runtime.

## Laws for the AI
- Work only on the current phase plan; list the files you will touch before editing.
- Colours, spacing, type only from the `@theme` tokens; `check-tokens` fails on raw hex/rgb.
- Validate every Server Action / API input and every AI output with zod; Server Actions never accept a userId. Import zod ONLY as `import * as z from '@/lib/zod'` (zod/mini, CSP-safe; ESLint enforces it).
- Supabase Auth calls (sign in/up, reset, verifyOtp) go from the BROWSER (modules/auth/ui) — never move them into Server Actions (per-IP rate limits). Never use the secret / service-role key in this app.
- `reloadTo()` only when the person changes (sign-in, sign-out, delete); every other navigation is <Link> / router.push.
- A new notes store must pass `notesStoreContract` (src/lib/notes/store.contract.ts) in its own test file before the app may use it.
- Secrets only in server env; never NEXT_PUBLIC_ for a secret; never the Supabase secret/service-role key in request handlers.
- The CSP is owned by `src/middleware.ts` (per-request nonce). Never add a second CSP (next.config / _headers), never put the nonce in style-src, never turn on `cacheComponents` while nonces are on.
- Every page must render dynamically (the root layout reads headers()); `check-dynamic` fails the build otherwise.
- Paste real gate output; never claim a gate passed without it. Never weaken or skip a gate; never delete a test to go green.
- Update docs/STATUS.md and docs/DECISIONS.md at the end of every phase.

## Design system & Turnkey Arsenal (use it — never re-invent it)
- Master barrel export: Import directly from `@/components/ui`:
  `Button`, `ButtonLink`, `GlassCard`, `AwsPrecisionCard`, `SpotlightCard`, `MetricStatCard`, `Input`, `TextArea`, `Field`, `Badge`, `Modal`, `Tabs`, `Accordion`, `AudioEqualizerPill`, `FpsCounter`.
- Turnkey Universal Pages: Pre-built in `src/app/`: `/` (Home), `/studio` (Canvas), `/settings` (Preferences & Turbo Mode), `/support` (Feedback & FAQ), `/about` (Manifesto & Team), `/login` & `/account` (Auth).
- See it before you build: **/design** — every primitive and variant, light + dark, with usage. Components live in `src/components/ui/`.
- Speed & Zero-Blur Turbo Engine: `data-perf="turbo"` sets `backdrop-filter: none !important` and bypasses expensive GPU Gaussian blurs for pure 98% semi-opaque Ceramic & Obsidian compositing.

## Project Design Theme Decision Matrix (Permanent Workspace Standards)
When building or extending apps in the workspace, apply the pre-decided archetype:
1. **05-quotemaker & 01-xeraphine (Commercial ERP / Invoicing)**: `data-dense-productivity` — High information density, monospace financial figures, crisp hairline dividers, zero blur on scrolling lists, Alabaster light / Slate dark.
2. **12-himanshukr-platform / portfolio (Personal Brand)**: `editorial-minimalism` — High-prestige typographic hierarchy, mouse-following SpotlightCards, generous margins, subtle warm-neutral dark mode.
3. **12-himanshukr-platform / notes (Personal Knowledge Base)**: `quiet-flat` — Split-pane navigation, distraction-free markdown canvas, flat opaque surfaces, zero shadows, instant search.
4. **Hackathon AI Apps (Mayday AI, Karz AI, SIH Smriti)**: `cyber-saas` — Pitch dark obsidian canvas, neon cyan `#00e5ff` accents, live pulsing beacon dots, command palette, hero cyber-solid CTA.
5. **Hackathon Game Apps (16-airgap_game)**: `kinetic-game` — Large 48px touch targets, high-contrast accessibility badges, live audio equalizer pill, spring-pop physical presses.
6. **Romantic Stories Platform (Creative Writing / Reader)**: `editorial-romance` — Paper cream `#faf8f5` / Midnight sepia `#141210`, serif body (`Merriweather`/`Lora`), reading focus mode, chapter drawer, procedural rain/vinyl audio.
- See it before you build: **`/design`** — every primitive and variant, light + dark, with usage. Components live in `src/components/ui/`: Button + ButtonLink, Input + TextArea + Field, Badge, Modal (native dialog), GlassCard; class recipes in `ui/classes.ts`.
- Pages (`src/app/**`) never use raw `<button>`, `<input>`, `<textarea>`, `<select>` or `<dialog>` — ESLint fails with the primitive to use instead.
- Buttons: `<Button variant size sound>` — variants primary · secondary · quiet · danger · glass · cyber-solid · cyber-outline · expander-pill. A button that navigates is `<ButtonLink href>`; never `<Link><Button>` (axe "nested-interactive" fails the e2e test).
- Class recipes for plain elements: `@/components/ui/classes` (btn, primary, quiet, danger, field, card, linkButton).
- Cards: `<GlassCard>` for frosted panels; a clickable card follows `AwsPrecisionCard`: the title is the ONE real button, stretched over the card with `after:absolute after:inset-0`, extra buttons sit above it with `relative z-10`. Never `role="button"` on a container that holds buttons.
- Colour: tokens only — bg-surface, bg-surface-2, text-fg, text-fg-muted, border-border, bg-brand + text-brand-fg, success / warning / danger, cyan for fills and `text-cyan-fg` for cyan TEXT. Text must reach 4.5:1 (the a11y e2e test fails otherwise); hover darkens (`brightness-90`), never fades text with opacity.
- Type, 3 tiers: `font-teroxia` only for hero calls to action (Button cyber-solid), `font-sans` for all UI, `font-mono tabular-nums` for numbers and ids.
- Sound: Button plays a tick by default; the header equalizer pill is the remembered mute switch; use `sound="none"` on rapid or repeated controls.
- Motion: "Reduce effects" switches animations off (globals.css) — keep it working; no new infinite animations inside `backdrop-blur` areas.
- Speed: a big library loads on demand (`await import(…)`, like the Supabase client) — `check-chunks` fails any chunk over 60 KB gzip; real-visit LCP / CLS / INP arrive as `web_vital` telemetry (components/WebVitals.tsx).
- `content-visibility` / `.cv-lazy` only on long lists below the fold — never above the fold, never on anything with popovers or glows (`contain: paint` clips them); `will-change` only while something animates; no always-running animation loops (an FPS meter only behind `?debug`).
- Words on screen: never "encrypted", "120 FPS", "zero latency", "unhackable" — check-honesty fails; measure first, then say it.
- Your app's colour: `npm run hk:init -- … --brand "#rrggbb"` (or edit `--color-brand` in globals.css, light + dark) — components never change for a rebrand.
- ⚠️ Font licence: TeroxiaDemo (public/fonts) is PERSONAL-USE only. Buy a licence or replace the file + `--font-teroxia` before any commercial or client use.

## Traps already learned (do not re-learn them)
- **"Still failing" may be an old build:** after a push, prove it with `npm run check:live -- https://starter.hkr.dpdns.org --expect-head` — it passes only when the live site runs your current commit, and says if it is unpushed or still building.
- **OpenNext needs `esbuild` declared** (it imports it without listing it): keep `esbuild` in devDependencies or Workers Builds fails with "Cannot find package 'esbuild'". `check-opennext` enforces it.
- **A lockfile dry-run is not a build:** before trusting a deploy fix, run the real `npx opennextjs-cloudflare build` (and `npx wrangler deploy --dry-run` for the size) — locally only as a check, never to deploy.
- **Lockfile vs Cloudflare's npm:** Workers Builds runs `npm ci` with npm 10.9.2; a lock written by npm 11 can fail there ("Missing: … from lock file"). After any dependency change run `npm run lock`; the pre-commit hook blocks an incompatible lockfile.
- **A random e2e step times out only in the full suite** → the laptop is overloaded, not the app broken: Playwright workers come from the CPU count (playwright.config.ts); read the trace's request timings before changing a test.
- **Flaky e2e = a test that samples short-lived UI:** the bar of an instant navigation lasts ~0.5 s; record it in the page with a MutationObserver from before the action (see e2e/top-loader.spec.ts), and wait for hydration before the first click.
- **Sync rules live in two places:** the engine (src/modules/synced/engine.ts) AND the database trigger (supabase/migrations/0001). Change one → change both, and run src/modules/synced/synced-store.test.ts.
- **Heredocs mangle backslashes** (regex, `\`): write such files with an editor tool or a script file, never `cat <<EOF`.
- **Service worker:** registered only in production builds (so every Playwright test runs with it); in `next dev` the registrar UNREGISTERS old workers. Debug a cached answer by its `x-hk-offline: 1` header. Changing SHELL pages or the precache rules = run `e2e/offline.spec.ts`.
- **Top Loader:** it starts from `onRouterTransitionStart` in `src/instrumentation-client.ts`. Never go back to a click listener — <Link> calls preventDefault(), so it never fires; and it never sees router.push or Back.
- **Tailwind v4 tokens:** never name a colour like a text size (`--color-sm`) — both make `.text-*` and the colour silently wins. An arbitrary value (`bg-[…]`) cannot override a named token. A class whose token does not exist produces NO CSS, silently.
- **Next 16 types:** route helper types (`LayoutProps`, `PageProps`) are generated — `check:fast` runs `next typegen` before `tsc`. Next 16 keeps `next dev` in `.next/dev`, separate from `next build`; no distDir split.
- **Stale servers:** `next start` serves the build it booted with — restart it after every rebuild and kill old instances, or you will chase false failures.
- **A dev-only 404 on a route whose file exists** is a stale dev cache, not a routing bug: stop `next dev`, delete `.next/dev`, restart.
- **Deploy commands live in the Cloudflare dashboard** (`npx opennextjs-cloudflare build` / `npx wrangler deploy`) — they call no npm script, so renaming scripts cannot break deploys; keep `"build": "next build"` (OpenNext calls it; making it OpenNext recurses forever).
- **Next.js MCP:** while `next dev` runs, `/_next/mcp` exposes routes, logs and compilation issues to agents — prefer it over guessing.

## DO NOT
- Add dependencies without asking · edit files under `scripts/` (they are a verbatim copy of HK_KIT) · write numbers into docs that are not in `docs/FACTS.md` or `docs/CLAIMS.md` · start long-running dev servers for the human (they run them).
