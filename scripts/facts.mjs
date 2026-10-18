// scripts/facts.mjs — [BLD-10] generates docs/FACTS.md straight from the code (and the HK Gate Scorecard from .hk/gates.json).
// RULE: every number in the pitch, README, or any audit doc must come from this file
// (or be labelled ASSUMPTION in docs/CLAIMS.md). Never hand-edit FACTS.md.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { loadConfig } from './lib/config.mjs';
import { collect } from './lib/walk.mjs';

const cfg = loadConfig();
const git = (...a) => { try { return execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return 'n/a'; } };
const appDir = [cfg.paths.app, 'src/app', 'app'].find((d) => existsSync(d));
const appFiles = appDir ? collect(appDir, ['.tsx', '.ts', '.jsx', '.js', '.mdx']) : [];
const toRoute = (f) => '/' + f.slice(appDir.length + 1).split(/[\\/]/).slice(0, -1).filter((s) => !/^\(.*\)$/.test(s) && !s.startsWith('@')).join('/');
const pages = [...new Set(appFiles.filter((f) => /[\\/]page\.(tsx?|jsx?|mdx)$/.test(f)).map(toRoute))].sort();
const apis = [...new Set(appFiles.filter((f) => /[\\/]route\.[jt]s$/.test(f)).map(toRoute))].sort();

const testFiles = collect([cfg.paths.src, 'tests', 'test', 'e2e'], ['.ts', '.tsx', '.js', '.mjs']).filter((f) => /\.(test|spec)\./.test(f));
const testCases = testFiles.reduce((n, f) => n + (readFileSync(f, 'utf8').match(/\b(it|test)\s*\(\s*['"`]/g) || []).length, 0);
const srcFiles = collect(cfg.paths.src, ['.ts', '.tsx', '.js', '.jsx', '.css']);
const loc = srcFiles.reduce((n, f) => n + readFileSync(f, 'utf8').split('\n').length, 0);
const migrations = existsSync(cfg.paths.migrations) ? collect(cfg.paths.migrations, ['.sql']) : [];
const tables = [...new Set(migrations.flatMap((f) => [...readFileSync(f, 'utf8').toLowerCase()
  .matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?"?([a-z0-9_]+)/g)].map((m) => m[1])))].sort();

const pkg = existsSync('package.json') ? JSON.parse(readFileSync('package.json', 'utf8')) : {};
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const KEY = ['next', 'react', 'typescript', 'tailwindcss', '@supabase/supabase-js', '@supabase/ssr', '@opennextjs/cloudflare', 'wrangler',
  'idb', 'dexie', '@capacitor/core', '@capacitor/android', 'framer-motion', 'motion', 'zod', 'vitest', '@playwright/test'];

// HK Gate Scorecard: the last recorded run of each gate on this machine, grouped by pillar prefix
const PILLARS = ['BLD', 'STK', 'SEC', 'PRF', 'OFF', 'DEV', 'OPS'];
let gates = null;
try { gates = Object.values(JSON.parse(readFileSync('.hk/gates.json', 'utf8'))).filter((g) => g && g.gate && g.rule); } catch { /* no runs recorded yet */ }
let scoreRow = '', scorecard = '';
if (gates?.length) {
  const pillarOf = (g) => { const p = String(g.rule).split(/[-/]/)[0]; return PILLARS.includes(p) ? p : 'other'; };
  const latest = (list) => list.map((g) => g.at).sort().at(-1) ?? 'n/a';
  const passed = gates.filter((g) => g.ok).length;
  const rows = [...PILLARS, 'other'].map((p) => [p, gates.filter((g) => pillarOf(g) === p)]).filter(([, l]) => l.length)
    .map(([p, l]) => `| ${p} | ${l.filter((g) => g.ok).length}/${l.length} | ${latest(l)} |`);
  const detail = [...gates].sort((x, y) => String(x.rule).localeCompare(String(y.rule)) || x.gate.localeCompare(y.gate))
    .map((g) => `| ${g.gate} | ${g.rule} | ${g.ok ? '✅ pass' : '❌ fail'} | ${g.problems ?? 0} | ${g.warnings ?? 0} | ${g.at ?? 'n/a'} |`);
  scoreRow = `| HK gates passing (last recorded run) | ${passed}/${gates.length} |\n`;
  scorecard = `
## HK Gate Scorecard
> From \`.hk/gates.json\` — the last recorded result of each gate on this machine. Re-run the gates before quoting it.

| Pillar | Passed | Last run |
|---|---|---|
${rows.join('\n')}
| **Total** | **${passed}/${gates.length}** | ${latest(gates)} |

| Gate | Rule | Result | Problems | Warnings | Last run |
|---|---|---|---|---|---|
${detail.join('\n')}
`;
}

const md = `# FACTS (auto-generated — do not edit)
> Generated ${new Date().toISOString()} from commit \`${git('rev-parse', '--short', 'HEAD')}\` by \`npm run facts\`.
> Quote these numbers exactly. Anything not listed here is an ASSUMPTION and must say so.

| Fact | Value |
|---|---|
| Page routes | ${pages.length} |
| API routes | ${apis.length} |
| Test files / test cases (static count) | ${testFiles.length} / ${testCases} |
| Source files / lines in ${cfg.paths.src} | ${srcFiles.length} / ${loc} |
| Database tables (from migrations) | ${tables.length}${tables.length ? ` (${tables.join(', ')})` : ''} |
| Total dependencies | ${Object.keys(deps).length} |
${scoreRow}${KEY.filter((k) => deps[k]).map((k) => `| ${k} | ${deps[k]} |`).join('\n')}

## Page routes
${pages.map((p) => `- \`${p}\``).join('\n') || '- none'}

## API routes
${apis.map((p) => `- \`${p}\``).join('\n') || '- none'}
${scorecard}`;
mkdirSync('docs', { recursive: true });
writeFileSync('docs/FACTS.md', md);
console.log(`📊 facts [BLD-10]: docs/FACTS.md written — ${pages.length} pages, ${apis.length} APIs, ${testCases} test cases, ${tables.length} tables${gates?.length ? `, ${gates.filter((g) => g.ok).length}/${gates.length} HK gates passing` : ''}`);
