// scripts/check-dynamic.mjs — [SEC-6] run after `next build`. With a nonce CSP (hk.config.json live.expectNonceCsp) every HTML page must render
// per request: a page prerendered at build time ships framework <script>s without the request's nonce, and the browser blocks them —
// the page looks fine in `next dev` and is dead in production. Fix: read headers() (e.g. the x-nonce) in the root layout, or await connection().
//   node scripts/check-dynamic.mjs [distDir]        (default .next)
// Reads <distDir>/prerender-manifest.json: prerendered PAGES carry an .rsc dataRoute; metadata files and route handlers (robots.txt,
// sitemap.xml, favicon.ico, icons, static GET handlers) have none and are fine — they are not HTML.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadConfig } from './lib/config.mjs';
import { report } from './lib/walk.mjs';

// Framework pages Next always prerenders that a nonce cannot reach: global-error.tsx must be a Client Component (it cannot read headers()).
// It only renders after a crash; its markup still shows without scripts.
const ALWAYS_STATIC = new Set(['/_global-error']);

const cfg = loadConfig();
if (!cfg.live.expectNonceCsp) { console.log('⏭️  check-dynamic: live.expectNonceCsp is off (static CSP mode) — skipped'); process.exit(0); }

const dist = process.argv[2] || '.next';
const file = join(dist, 'prerender-manifest.json');
const problems = [], warnings = [];
if (!existsSync(file)) problems.push(`${file} not found — run \`next build\` first (this gate reads the production build)`);
else {
  let routes = {};
  try { routes = JSON.parse(readFileSync(file, 'utf8')).routes ?? {}; } catch (e) { problems.push(`${file} is not valid JSON: ${e.message}`); }
  for (const [route, info] of Object.entries(routes)) {
    if (!info?.dataRoute || ALWAYS_STATIC.has(route)) continue;   // not an HTML page, or a page a nonce can never reach
    if (route === '/_not-found') warnings.push('/_not-found is prerendered — its scripts will be blocked by the CSP (links still work); a dynamic root layout makes it dynamic too');
    else problems.push(`${route} is prerendered at build time — under a nonce CSP its scripts are blocked in production; read headers() in the root layout or await connection() in the page`);
  }
}
report('check-dynamic', 'SEC-6', problems, warnings);
