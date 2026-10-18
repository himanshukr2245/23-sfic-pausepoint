// scripts/check-chunks.mjs — [PRF-1] no single client JavaScript chunk may outgrow the budget (gzip), after `next build`.
// Why: one import (`import { z } from 'zod'`) once put a 95 KB-gzip chunk on the notes screen — route weight still passed. A chunk
// budget catches that the day it happens. The framework's own runtime (React DOM, recognised by its error-page URL) is exempt.
//   node scripts/check-chunks.mjs          hk.config.json weight.maxChunkKB (default 60) · prints the 5 biggest chunks
import { readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { loadConfig } from './lib/config.mjs';
import { collect, report } from './lib/walk.mjs';

const cfg = loadConfig();
const budget = cfg.weight?.maxChunkKB ?? 60;
const dir = existsSync('.next/static/chunks') ? '.next/static/chunks' : null;
const problems = [], warnings = [];
if (!dir) problems.push('no .next/static/chunks — run `next build` first');
else {
  const FRAMEWORK = /react\.dev\/errors\/|reactjs\.org\/docs\/error-decoder/;   // React DOM production builds link to their error page
  // A big library that loads ON DEMAND (dynamic import — e.g. supabase-js only when accounts are used) may be exempted, visibly and with a
  // reason: hk.config.json weight.chunkExempt: [{ "contains": "GoTrueClient", "why": "…" }]. Prove "on demand" with an e2e test.
  const exempt = (cfg.weight?.chunkExempt ?? []).filter((e) => e?.contains && String(e.why ?? '').trim().length >= 10);
  const rows = collect([dir], ['.js']).map((f) => {
    const src = readFileSync(f);
    const text = src.toString('latin1');
    return { f: f.replaceAll('\\', '/'), kb: gzipSync(src).length / 1024, framework: FRAMEWORK.test(text), exempt: exempt.find((e) => text.includes(e.contains)) };
  }).sort((a, b) => b.kb - a.kb);
  for (const r of rows) {
    if (r.framework || r.kb <= budget) continue;
    if (r.exempt) warnings.push(`${r.f} is ${r.kb.toFixed(1)} KB gzip — exempt: ${r.exempt.why}`);
    else problems.push(`${r.f} is ${r.kb.toFixed(1)} KB gzip (budget ${budget} KB) — find the import that grew it (a whole library instead of what you use?)`);
  }
  console.log(`📦 check-chunks: ${rows.length} chunk(s), budget ${budget} KB gzip each (framework exempt) — biggest: ${rows.slice(0, 5).map((r) => `${r.kb.toFixed(1)}${r.framework ? '*' : ''}`).join(' · ')} KB (* framework)`);
}
report('check-chunks', 'PRF-1', problems, warnings);
