// scripts/verify-lock.mjs — [STK-3] package-lock.json must install with the npm the deploy uses.
// Cloudflare Workers Builds runs `npm ci` with its own npm (10.9.2 on 2026-10-07 — "Detected … npm@10.9.2" in the build log); a lockfile
// written by a newer local npm (11.x) can be valid for you and rejected there: "npm ci can only install packages when your package.json and
// package-lock.json … are in sync … Missing: @emnapi/runtime … from lock file". This gate catches it before you push.
//   node scripts/verify-lock.mjs            check (npm ci --dry-run with the deploy npm)
//   node scripts/verify-lock.mjs --staged   same, but only when package-lock.json is staged (used by the pre-commit hook)
//   node scripts/verify-lock.mjs --fix      rewrite package-lock.json with the deploy npm (`npm run lock`)
// The npm version lives in hk.config.json → deploy.npmVersion. No network (first run downloads that npm once): a warning, never a block.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { loadConfig } from './lib/config.mjs';
import { report } from './lib/walk.mjs';

const args = new Set(process.argv.slice(2));
const npmVersion = loadConfig().deploy?.npmVersion || '10.9.2';
if (!/^\d+\.\d+\.\d+$/.test(npmVersion)) { console.error(`hk.config.json deploy.npmVersion must look like 10.9.2 (got ${JSON.stringify(npmVersion)})`); process.exit(2); }

if (args.has('--staged')) {
  const staged = spawnSync('git', ['diff', '--cached', '--name-only'], { encoding: 'utf8' }).stdout ?? '';
  if (!staged.split(/\r?\n/).includes('package-lock.json')) process.exit(0);   // nothing to verify: stay instant
}
if (!existsSync('package-lock.json')) { report('verify-lock', 'STK-3', ['package-lock.json is missing — run `npm install`, then `npm run lock`'], []); process.exit(); }

// Runs `npx npm@<version> <args>`. HK_VERIFY_LOCK_CMD (a node script path) replaces npx in tests.
function npm(npmArgs) {
  if (process.env.HK_VERIFY_LOCK_CMD) return spawnSync(process.execPath, [process.env.HK_VERIFY_LOCK_CMD, ...npmArgs], { encoding: 'utf8' });
  const opts = { encoding: 'utf8', timeout: 240_000 };
  // Windows needs a shell for npx.cmd: pass ONE fixed command string (version validated above, args are literals) — never args + shell (DEP0190)
  return process.platform === 'win32'
    ? spawnSync(`npx --yes npm@${npmVersion} ${npmArgs.join(' ')}`, { ...opts, shell: true })
    : spawnSync('npx', ['--yes', `npm@${npmVersion}`, ...npmArgs], opts);
}

if (args.has('--fix')) {
  const r = npm(['install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund']);
  if (r.status !== 0) { console.error(r.stdout + r.stderr); report('verify-lock', 'STK-3', [`npm@${npmVersion} could not rewrite package-lock.json (see output above)`], []); process.exit(); }
  console.log(`🔒 package-lock.json rewritten with npm@${npmVersion}`);
}

const r = npm(['ci', '--dry-run', '--ignore-scripts', '--no-audit', '--no-fund']);
const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
const problems = [], warnings = [];
if (r.status !== 0) {
  const missing = [...out.matchAll(/Missing: (\S+) from lock file/g)].map((m) => m[1]);
  if (missing.length || /in sync/i.test(out))
    problems.push(`package-lock.json does not install with npm@${npmVersion} (the deploy's npm)${missing.length ? ` — missing ${missing.join(', ')}` : ''}. Fix: npm run lock (or node scripts/verify-lock.mjs --fix), then commit the lockfile`);
  else warnings.push(`could not verify with npm@${npmVersion} (offline or npx failed): ${out.trim().split(/\r?\n/).slice(-1)[0] ?? r.error?.message ?? 'unknown error'}`);
}
report('verify-lock', 'STK-3', problems, warnings);
