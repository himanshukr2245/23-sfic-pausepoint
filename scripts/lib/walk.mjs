// scripts/lib/walk.mjs — shared helpers for every gate (Node 20+, zero dependencies)
import { readdirSync, statSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKIP = new Set(['node_modules', '.next', '.next-dev', 'out', '.git', 'android', 'ios', 'dist', 'build',
  '.open-next', '.wrangler', '.vercel', 'coverage', 'playwright-report', 'test-results', '.hk']);

/** Collect files under the given paths (files or folders), optionally filtered by extension. */
export function collect(paths, exts) {
  const files = [];
  const visit = (p) => {
    if (!existsSync(p)) return;
    if (statSync(p).isFile()) { if (!exts || exts.includes(extname(p))) files.push(p); return; }
    for (const e of readdirSync(p, { withFileTypes: true })) {
      if (!SKIP.has(e.name)) visit(join(p, e.name));
    }
  };
  [].concat(paths).forEach(visit);
  return files;
}

/** Remember the last result of each gate in ./.hk/gates.json (merged by gate name) — facts.mjs turns it into the scorecard. Never throws. */
export function record(gate, rule, problems = [], warnings = []) {
  try {
    const dir = join(process.cwd(), '.hk'), file = join(dir, 'gates.json');
    let all = {};
    try { all = JSON.parse(readFileSync(file, 'utf8')); } catch { /* first run or corrupt — start fresh */ }
    if (!all || typeof all !== 'object' || Array.isArray(all)) all = {};
    all[gate] = { gate, rule, ok: problems.length === 0, problems: problems.length, warnings: warnings.length, at: new Date().toISOString() };
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, JSON.stringify(all, null, 2) + '\n');
  } catch { /* read-only checkout, .hk is a file, CI sandbox — the gate result still prints */ }
}

/** Print a result tagged with its rule ID, record it, and fail the process (exit code 1) if there are problems. */
export function report(name, rule, problems, warnings = []) {
  if (Array.isArray(rule)) [rule, problems, warnings] = ['-', rule, problems ?? []];   // old report(name, problems, warnings) callers
  record(name, rule, problems, warnings);
  for (const w of warnings) console.warn(`⚠️  ${name} [${rule}]: ${w}`);
  if (problems.length === 0) { console.log(`✅ ${name} [${rule}]: clean`); return; }
  console.error(`❌ ${name} [${rule}]: ${problems.length} problem(s)`);
  for (const p of problems) console.error(`   • ${p}`);
  process.exitCode = 1;                                   // not process.exit(): lets piped output flush first
}

/** True when this module is the script node was started with (lets a gate also export its logic). */
export const isMain = (url) => !!process.argv[1] && resolve(process.argv[1]).toLowerCase() === fileURLToPath(url).toLowerCase();
