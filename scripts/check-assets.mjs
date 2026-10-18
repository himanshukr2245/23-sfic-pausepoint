// scripts/check-assets.mjs — [PRF-3] every asset the code asks for exists, every shipped file is used, and the asset dirs stay inside budget.
//   node scripts/check-assets.mjs              → missing refs + dead files + size budgets (+ pixel widths when sharp is installed)
//   node scripts/check-assets.mjs --no-dead    → skip the dead-file check (early prototype, art still arriving)
//   node scripts/check-assets.mjs --list-dead  → print the dead files, one per line, exit 0 (review before cleanup-dead-assets --apply)
// Template paths like `/art/objects/${face}.webp` cannot be resolved from the template alone — list them in hk.config.json:
//   "nameLists": [{ "file": "src/features/games/logic.ts", "constant": "FACES", "template": "/art/objects/{name}.webp" }]
import { readFileSync } from 'node:fs';
import { loadConfig } from './lib/config.mjs';
import { scanAssets } from './lib/assets.mjs';
import { report } from './lib/walk.mjs';

const cfg = loadConfig();
const args = process.argv.slice(2);
const a = cfg.assets;
const scan = scanAssets(cfg);
const kb = (b) => (b / 1024).toFixed(0);

if (args.includes('--list-dead')) {
  for (const d of scan.dead) console.log(d.rel);
  console.error(`${scan.dead.length} dead file(s), ${kb(scan.dead.reduce((n, d) => n + d.bytes, 0))} KB`);
} else {
  const problems = [...scan.configErrors], warnings = [];
  for (const m of scan.missing) problems.push(m.caseOnly
    ? `${m.where} → ${m.url} differs from the file on disk only by letter case — works on Windows, 404s on Cloudflare`
    : `${m.where} → ${m.url} (missing in ${cfg.paths.public}/)`);
  if (!args.includes('--no-dead'))
    for (const d of scan.dead) problems.push(`${d.rel} is referenced nowhere (${kb(d.bytes)} KB shipped for nothing) — cleanup-dead-assets --apply, or add it to assets.nameLists / assets.exempt`);
  const mb = scan.totalBytes / 1048576;
  if (mb > a.maxTotalMB) problems.push(`${a.dirs.join(' + ')} total ${mb.toFixed(2)} MB — budget is ${a.maxTotalMB} MB`);
  for (const f of scan.files) if (!f.exempt && f.bytes > a.maxFileKB * 1024) problems.push(`${f.rel} is ${kb(f.bytes)} KB — budget is ${a.maxFileKB} KB per file (run optimise-art)`);

  let sharp = null;
  try { sharp = (await import('sharp')).default; } catch { warnings.push(`sharp is not installed — pixel-width check (maxWidthPx ${a.maxWidthPx}) skipped: npm i -D sharp`); }
  if (sharp) for (const f of scan.files) {
    if (f.exempt || !/\.(png|jpe?g|webp|avif)$/i.test(f.file)) continue;
    const { width = 0 } = await sharp(readFileSync(f.file)).metadata();   // buffer, not path: sharp holds Windows files open lazily
    if (width > a.maxWidthPx) problems.push(`${f.rel} is ${width}px wide — cap is ${a.maxWidthPx}px (2× a large phone); run measure-art-sizes + optimise-art`);
  }
  console.log(`🖼️  check-assets: ${scan.referenced.size} referenced path(s) · ${scan.files.length} file(s) in ${a.dirs.join(', ')} · ${mb.toFixed(2)} of ${a.maxTotalMB} MB`);
  report('check-assets', 'PRF-3', problems, warnings);
}
