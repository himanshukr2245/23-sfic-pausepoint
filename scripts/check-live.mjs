// scripts/check-live.mjs — [OPS-4 / SEC-6 / SEC-12] run after every deploy against the real URL:
//   node scripts/check-live.mjs https://your-app.example.workers.dev      (npm run check:live -- <url>)
//  1. security headers on the home page (same rules as check-headers)       [SEC-6]
//  2. GET + HEAD <live.health> → 200, and the GET body is JSON with "status" [OPS-4]
//  3. the admin path and its /mfa subpath answer a stranger EXACTLY like a random unknown URL: same status, no Location,
//     no X-Robots-Tag the 404 doesn't have — a stranger's /hk-admin must be indistinguishable from any 404   [SEC-12]
//  4. decoys (/admin, /wp-admin) → 404 with no Location (a redirect would reveal the real path)               [SEC-12]
//  5. robots.txt does not list the admin path (that would advertise it)                                       [SEC-12]
//  6. live.expectNonceCsp: exactly one CSP, carrying a nonce (proof the middleware/proxy ran), a NEW nonce per request,
//     every executable <script> on / carries it, and the HTML is private/no-store (never cached for other visitors)   [SEC-6]
//  7. every live.smoke path → 200                                                                             [OPS-4]
//  8. optional — live.supabaseUrl (or NEXT_PUBLIC_SUPABASE_URL): the project's JWKS has an asymmetric key      [SEC-3]
//  9. the live release (health JSON "release" = the build's commit) vs your local git HEAD — says plainly when the site is behind:
//     unpushed commits, or pushed but the Workers Build is still running / failed. A warning; with --expect-head a problem.   [OPS-5]
//     After every push: `npm run check:live -- <url> --expect-head` — a deploy fix is only done when the live site runs it.
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { loadConfig } from './lib/config.mjs';
import { report } from './lib/walk.mjs';
import { checkHeaders } from './check-headers.mjs';

const cli = process.argv.slice(2);
const expectHead = cli.includes('--expect-head');
const base = (cli.find((a) => !a.startsWith('--')) || '').replace(/\/+$/, '');
if (!/^https?:\/\/[^/]+/.test(base)) { console.error('usage: node scripts/check-live.mjs <https://your-app.example> [--expect-head]'); process.exit(2); }
const live = loadConfig().live;
const problems = [], warnings = [];

/** One request, never throws: { status, headers, text } — status 0 = network error. A network error is retried once after 2 s:
 *  a single blip (a cold connection, IPv6 tried first on a network without it) must not be reported as "site unreachable". */
async function hit(path, method = 'GET', retry = true) {
  try {
    const res = await fetch(base + path, { method, redirect: 'manual', signal: AbortSignal.timeout(15_000), headers: { 'user-agent': 'hk-check-live' } });
    return { status: res.status, headers: res.headers, text: method === 'HEAD' ? '' : await res.text() };
  } catch (e) {
    if (retry) { await new Promise((r) => setTimeout(r, 2_000)); return hit(path, method, false); }
    return { status: 0, headers: new Headers(), text: '', error: e.cause?.code || e.message };
  }
}
const down = (r) => (r.status === 0 ? ` (${r.error})` : '');
const nonceOf = (r) => (r.headers.get('content-security-policy') || '').match(/'nonce-([^']+)'/)?.[1] ?? null;

/** 6 — a nonce CSP only protects anything if it is the ONLY policy, fresh per request, on every executable script, and the HTML is not cached. */
async function checkNonce(home) {
  const csp = home.headers.get('content-security-policy') || '';
  const policies = (csp.match(/default-src/g) || []).length;                 // fetch joins repeated headers with ", "
  if (policies > 1) problems.push(`[SEC-6] ${policies} Content-Security-Policy headers — the browser enforces all of them; set the CSP in middleware only (not also in next.config / _headers)`);
  const nonce = nonceOf(home);
  if (!nonce) { problems.push("[SEC-6] CSP has no 'nonce-…' — the middleware/proxy that sets it did not run on this deploy"); return; }
  const again = await hit('/');
  if (nonceOf(again) === nonce) problems.push('[SEC-6] the same nonce came back on two requests — the HTML is cached or static, so the nonce is guessable; render pages dynamically (read headers() in the root layout)');
  for (const [, attrs] of home.text.matchAll(/<script\b([^>]*)>/gi)) {
    const type = attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i)?.[1]?.toLowerCase();
    if (type && !/javascript|module/.test(type)) continue;                   // JSON / JSON-LD data blocks never execute
    const got = attrs.match(/\bnonce\s*=\s*["']?([^"'\s>]+)/i)?.[1];
    if (got !== nonce) { problems.push(`[SEC-6] a <script> on / ${got ? 'carries a different nonce' : 'has no nonce'} — the CSP will block it (page rendered without the request nonce)`); break; }
  }
  const cc = (home.headers.get('cache-control') || '').toLowerCase();
  if (!/private|no-store/.test(cc)) problems.push(`[SEC-6] HTML Cache-Control is "${cc || '(none)'}" — a shared cache could serve one visitor's nonce (and page) to others; expect private or no-store`);
}

const git = (...args) => { const r = spawnSync('git', args, { encoding: 'utf8' }); return r.status === 0 ? r.stdout.trim() : null; };

/** 9 — is the code on screen the code you just pushed? (Two "fixes" once looked like failures because the live site still ran an older build.) */
function checkRelease(health) {
  const head = git('rev-parse', 'HEAD');
  if (!head) return;                                                       // not inside a git repo: nothing to compare
  const release = typeof health?.release === 'string' ? health.release.toLowerCase() : null;
  const flag = (msg) => (expectHead ? problems : warnings).push(`[OPS-5] ${msg}`);
  if (!release || !/^[0-9a-f]{7,40}$/.test(release))
    return flag(`${live.health} reports release "${health?.release ?? '(none)'}" — not a commit id, so you cannot tell which code is live (NEXT_PUBLIC_RELEASE from WORKERS_CI_COMMIT_SHA, OPS-5)`);
  if (head.startsWith(release)) { console.log(`🚀 check-live: the live site runs your HEAD (${release})`); return; }
  const ahead = git('rev-list', '--count', '@{u}..HEAD');
  const why = ahead === null ? 'is your branch pushed? (no upstream branch to compare with)'
    : ahead !== '0' ? `${ahead} local commit(s) are not pushed yet — push them, then wait for the Workers Build`
    : `your HEAD is pushed, but the live site still runs ${release} — the Workers Build is still running or FAILED (Workers & Pages → your Worker → Deployments)`;
  flag(`live release ${release} ≠ your HEAD ${head.slice(0, 12)} — ${why}`);
}

/** Optional (live.supabaseUrl): getClaims() only verifies locally when the project signs JWTs with an asymmetric key. */
async function checkJwks(supabaseUrl) {
  const url = supabaseUrl.replace(/\/+$/, '') + '/auth/v1/.well-known/jwks.json';
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) { warnings.push(`[SEC-3] could not read ${url} (${res.status}) — check the project's JWT signing keys by hand`); return; }
    const keys = (await res.json())?.keys ?? [];
    if (!keys.some((k) => k?.kty === 'EC' || k?.kty === 'RSA' || k?.kty === 'OKP'))
      problems.push('[SEC-3] Supabase publishes no asymmetric signing key — getClaims() makes a network call to Supabase Auth on every request; switch the project to JWT signing keys');
  } catch (e) { warnings.push(`[SEC-3] could not reach ${url} (${e.cause?.code || e.message})`); }
}

async function probeAll() {
  // 1 + 6 — the home page
  const home = await hit('/');
  if (home.status === 0) { problems.push(`[OPS-4] ${base}/ is unreachable${down(home)} — nothing else checked`); return; }
  const h = checkHeaders(home.headers, base);
  problems.push(...h.problems.map((p) => `[SEC-6] ${p}`)); warnings.push(...h.warnings.map((w) => `[SEC-6] ${w}`));
  if (live.expectNonceCsp) await checkNonce(home);

  // 2 — health (liveness)
  const hg = await hit(live.health), hh = await hit(live.health, 'HEAD');
  if (hg.status !== 200) problems.push(`[OPS-4] GET ${live.health} → ${hg.status}${down(hg)} (expected 200)`);
  else { let j = null; try { j = JSON.parse(hg.text); } catch { /* not JSON */ } if (!j || typeof j !== 'object' || !('status' in j)) problems.push(`[OPS-4] GET ${live.health} did not return JSON with a "status" field`); else checkRelease(j); }
  if (hh.status !== 200) problems.push(`[OPS-4] HEAD ${live.health} → ${hh.status}${down(hh)} (expected 200 — export HEAD from the route)`);

  // 3 — the admin path must look exactly like an unknown URL to a stranger
  const probe = await hit(`/__hk-probe-${randomBytes(4).toString('hex')}`);
  for (const path of [live.adminPath, `${live.adminPath}/mfa`]) {
    const r = await hit(path);
    if (r.status !== probe.status) problems.push(`[SEC-12] ${path} → ${r.status} but an unknown URL → ${probe.status} — a stranger can tell the console exists`);
    if (r.headers.get('location')) problems.push(`[SEC-12] ${path} redirects to ${r.headers.get('location')} — strangers must get the plain 404, not a redirect`);
    if (r.headers.get('x-robots-tag') && !probe.headers.get('x-robots-tag')) problems.push(`[SEC-12] ${path} sends X-Robots-Tag but an unknown URL does not — set it only on the owner's pass-through response`);
  }

  // 4 — decoys
  for (const path of live.decoys) {
    const r = await hit(path);
    if (r.status !== 404) problems.push(`[SEC-12] decoy ${path} → ${r.status}${down(r)} (expected 404)`);
    if (r.headers.get('location')) problems.push(`[SEC-12] decoy ${path} redirects to ${r.headers.get('location')} — that reveals where the real console is`);
  }

  // 5 — robots.txt
  const robots = await hit('/robots.txt');
  if (robots.status === 200 && robots.text.toLowerCase().includes(live.adminPath.toLowerCase())) problems.push(`[SEC-12] robots.txt mentions ${live.adminPath} — that advertises it; de-index with X-Robots-Tag on the owner response instead`);

  // 7 — smoke
  for (const path of live.smoke) { const r = await hit(path); if (r.status !== 200) problems.push(`[OPS-4] smoke ${path} → ${r.status}${down(r)} (expected 200)`); }

  // 8 — optional: Supabase signs JWTs with an asymmetric key (fast, local getClaims)
  const supabaseUrl = live.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (supabaseUrl) await checkJwks(supabaseUrl);

  console.log(`🌍 check-live: ${base} · home ${home.status} · health ${hg.status}/${hh.status} · unknown-URL ${probe.status} · ${live.smoke.length} smoke path(s)`);
}

await probeAll();
report('check-live', 'OPS-4/SEC-6/SEC-12', problems, warnings);
