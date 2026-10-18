#!/usr/bin/env node
// scripts/check-opennext.mjs — [STK-3] preflight for Next.js on Cloudflare Workers via OpenNext.
// Explains (and prevents) "✘ [ERROR] The entry-point file at ".open-next/worker.js" was not found." and the newer traps:
// middleware.ts + proxy.ts together, experimental proxy.ts support, a shared dev/build .next folder, and Windows builds that 500 at runtime.
//   node scripts/check-opennext.mjs            (run in the app folder)
//   node scripts/check-opennext.mjs apps/web   (or point it at one)
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { report } from './lib/walk.mjs';

process.chdir(resolve(process.argv[2] || '.'));            // read the app's files and record the result in the app's .hk/
const problems = [], warnings = [], ok = [];
const read = (f) => (existsSync(f) ? readFileSync(f, 'utf8') : null);

/** Strip // and /* *\/ comments outside strings (JSONC), then trailing commas. */
function parseJsonc(text) {
  let out = '', i = 0, inStr = false;
  while (i < text.length) {
    const c = text[i], n = text[i + 1];
    if (inStr) { out += c; if (c === '\\') { out += n; i += 2; continue; } if (c === '"') inStr = false; i++; continue; }
    if (c === '"') { inStr = true; out += c; i++; continue; }
    if (c === '/' && n === '/') { while (i < text.length && text[i] !== '\n') i++; continue; }
    if (c === '/' && n === '*') { i += 2; while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++; i += 2; continue; }
    out += c; i++;
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, '$1'));
}
function wranglerConfig() {
  for (const f of ['wrangler.jsonc', 'wrangler.json']) { const t = read(f); if (t) return { file: f, cfg: parseJsonc(t) }; }
  const t = read('wrangler.toml');
  if (!t) return null;
  const get = (re) => (t.match(re) || [])[1];
  return { file: 'wrangler.toml', cfg: {
    main: get(/^\s*main\s*=\s*"([^"]+)"/m), compatibility_date: get(/^\s*compatibility_date\s*=\s*"([^"]+)"/m),
    compatibility_flags: (get(/^\s*compatibility_flags\s*=\s*\[([^\]]*)\]/m) || '').match(/"([^"]+)"/g)?.map((s) => s.slice(1, -1)) ?? [],
    assets: { directory: get(/directory\s*=\s*"([^"]+)"/) } } };
}

const pkg = read('package.json') ? JSON.parse(read('package.json')) : null;
let nextMajor = NaN;                                                // set below from the installed (or declared) next version
const onc = read('open-next.config.ts') || '';
if (!pkg) problems.push('package.json not found — run this inside the Next.js app folder (check the "Root directory" setting in Workers Builds for monorepos)');
else {
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  if (!deps['@opennextjs/cloudflare']) problems.push('@opennextjs/cloudflare is not installed → npm i @opennextjs/cloudflare@latest');
  // Security floor: the 30 Sep 2026 Next.js release fixed 7 CVEs (incl. a high-severity image-optimizer SSRF) in 15.5.27 / 16.3.8,
  // and @opennextjs/cloudflare 1.20.8+ accepts only those versions. Prefer the installed version over the range in package.json.
  const installed = read('node_modules/next/package.json');
  const nextVer = ((installed && JSON.parse(installed).version) || deps.next || '').replace(/^[^\d]*/, '');
  const [maj, min, pat] = nextVer.split('.').map((n) => parseInt(n, 10));
  nextMajor = maj;
  if (nextVer && Number.isFinite(maj)) {
    const below = (a, b, c) => min < b || (min === b && (pat || 0) < c);
    if (maj < 15 || (maj === 15 && below(15, 5, 27)) || (maj === 16 && below(16, 3, 8)))
      problems.push(`next ${nextVer} is below the patched release (15.5.27 / 16.3.8, security release of 30 Sep 2026) → npm i next@latest and redeploy`);
  }
  if (!deps.wrangler) problems.push('wrangler is not a dev dependency → npm i -D wrangler@latest');
  // @opennextjs/cloudflare imports esbuild at build time without declaring it; locally it is often hoisted by luck, but on Workers Builds it
  // can be present only as another package's optional peer, which npm does not install → "Cannot find package 'esbuild'" (7 Oct 2026)
  if (deps['@opennextjs/cloudflare'] && !deps.esbuild)
    problems.push("esbuild is not declared — @opennextjs/cloudflare imports it without declaring it, so Workers Builds can fail with \"Cannot find package 'esbuild'\" → npm i -D esbuild@^0.27 (the range OpenNext is tested with), then npm run lock");
  const s = pkg.scripts || {};
  if (/opennextjs-cloudflare/.test(s.build || '')) {
    if (/buildCommand\s*:/.test(onc)) ok.push('"build" runs OpenNext, and open-next.config.ts sets buildCommand (no recursion)');
    else problems.push('"build" runs opennextjs-cloudflare — OpenNext itself calls `npm run build`, so this recurses forever. Keep "build": "next build" (or set buildCommand in open-next.config.ts)');
  } else if (!/next build/.test(s.build || '')) warnings.push('"build" should be "next build" (OpenNext runs it for you)');
  if (!/opennextjs-cloudflare build/.test(s.deploy || '') || !/opennextjs-cloudflare (deploy|upload)/.test(s.deploy || ''))
    problems.push('"deploy" should be "opennextjs-cloudflare build && opennextjs-cloudflare deploy" — plain `wrangler deploy` never creates .open-next/worker.js');
  else ok.push('deploy script builds with OpenNext before deploying');
}

const w = wranglerConfig();
if (!w) problems.push('no wrangler.jsonc / wrangler.toml found');
else {
  const c = w.cfg;
  if (c.main !== '.open-next/worker.js') problems.push(`${w.file}: "main" must be ".open-next/worker.js" (found ${JSON.stringify(c.main)})`);
  if ((c.assets?.directory ?? '') !== '.open-next/assets') problems.push(`${w.file}: assets.directory must be ".open-next/assets"`);
  if (!(c.compatibility_flags || []).includes('nodejs_compat')) problems.push(`${w.file}: compatibility_flags must include "nodejs_compat"`);
  if (!c.compatibility_date) problems.push(`${w.file}: compatibility_date is missing`);
  if (!problems.some((p) => p.startsWith(w.file))) ok.push(`${w.file} points at the OpenNext output`);
}
if (!onc) problems.push('open-next.config.ts is missing (the OpenNext CLI creates it on first build, or add it from the template)');

// middleware.ts (edge) vs proxy.ts (Next 16, Node) — root or src/
const found = (base) => ['', 'src/'].flatMap((d) => ['.ts', '.js'].map((x) => `${d}${base}${x}`)).filter((f) => existsSync(f));
const mw = found('middleware'), px = found('proxy');
if (mw.length && px.length) problems.push(`both ${mw[0]} and ${px[0]} exist — Next.js runs only one; keep a single file (middleware.ts on OpenNext today)`);
if (px.length) warnings.push('OpenNext support for Next 16 proxy.ts (Node middleware) is experimental (merged Aug 2026, PR opennextjs-cloudflare#1309) — prefer middleware.ts until it is marked stable, and prove it runs with check-live');

const gi = read('.gitignore') || '';
if (!/\.open-next/.test(gi)) warnings.push('add "/.open-next/" to .gitignore (it is generated — never commit it)');
if (!/\.dev\.vars/.test(gi)) warnings.push('add ".dev.vars" to .gitignore (Wrangler local secrets)');
const nc = read('next.config.ts') || read('next.config.mjs') || read('next.config.js') || '';
if (!/initOpenNextCloudflareForDev/.test(nc)) warnings.push('next.config: add initOpenNextCloudflareForDev() so `next dev` can use Cloudflare bindings');
// Only a real `distDir:` property counts, and only one whose value depends on the mode. Comments are removed first: a comment that
// MENTIONS distDir is not a split, and NODE_ENV used elsewhere (removeConsole) is not one either — both once raised a false warning.
const ncCode = nc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
const splitsDist = /\bdistDir\s*:[^,\n}]*(NODE_ENV|\.next-dev|\bdev\b|isDev)/.test(ncCode);
if (nextMajor >= 16) {
  // Next 16 writes `next dev` output to .next/dev itself (separate from `next build`) and locks against duplicate runs
  if (splitsDist) warnings.push("next.config: remove the dev/build distDir split — Next 16 already keeps `next dev` in .next/dev, and a custom distDir moves dev types away from tsconfig's .next/dev/types");
} else if (!splitsDist)
  warnings.push("next.config: split dev and build output — distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next' (Next 15 and older share .next, so a build while `next dev` runs fails with missing-chunk errors)");
else if (/\.next-dev/.test(ncCode) && !/\.next-dev/.test(gi)) warnings.push('add ".next-dev/" to .gitignore');
if (!existsSync(join('.open-next', 'worker.js')))
  warnings.push('.open-next/worker.js does not exist yet — normal before a build. Workers Builds: Build command = `npx opennextjs-cloudflare build`, Deploy command = `npx wrangler deploy`');
if (process.platform === 'win32')
  warnings.push('Windows: OpenNext builds from Windows can upload fine and then 500 at runtime ("Dynamic require … is not supported") — deploy via git push → Workers Builds (Linux), or build in WSL2');

for (const m of ok) console.log(`✅ ${m}`);
report('check-opennext', 'STK-3', problems, warnings);
