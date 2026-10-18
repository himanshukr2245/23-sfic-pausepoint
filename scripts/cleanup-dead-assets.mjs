// scripts/cleanup-dead-assets.mjs — [PRF-3] moves files nothing references out of the asset dirs. Dry run unless --apply. Never deletes.
//   node scripts/cleanup-dead-assets.mjs           → lists what would move and what it saves
//   node scripts/cleanup-dead-assets.mjs --apply   → moves them into .hk/trash/<timestamp>/ (same relative paths) — restore by moving back
// "Dead" comes from the same scan as check-assets: list template-built paths in assets.nameLists first, or they look dead.
import { mkdirSync, renameSync, cpSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { loadConfig } from './lib/config.mjs';
import { scanAssets } from './lib/assets.mjs';

const apply = process.argv.includes('--apply');
const scan = scanAssets(loadConfig());
const total = scan.dead.reduce((n, d) => n + d.bytes, 0);

if (scan.configErrors.length) {
  for (const e of scan.configErrors) console.error(`❌ cleanup-dead-assets [PRF-3]: ${e}`);
  console.error('Refusing to touch files while the reference scan is incomplete.');
  process.exitCode = 1;
} else if (!scan.dead.length) {
  console.log('✅ cleanup-dead-assets [PRF-3]: no dead files');
} else {
  const trash = join('.hk', 'trash', new Date().toISOString().replace(/[:.]/g, '-'));
  for (const d of scan.dead) {
    console.log(`  ${apply ? 'moved     ' : 'would move'}  ${d.rel}  (${(d.bytes / 1024).toFixed(0)} KB)`);
    if (!apply) continue;
    const dest = join(trash, d.rel);
    mkdirSync(dirname(dest), { recursive: true });
    try { renameSync(d.file, dest); }
    catch (e) { if (e.code !== 'EXDEV') throw e; cpSync(d.file, dest); rmSync(d.file); }   // other drive: copy, then remove the original
  }
  const mb = (total / 1048576).toFixed(2);
  console.log(apply
    ? `\n🧹 cleanup-dead-assets [PRF-3]: moved ${scan.dead.length} file(s), ${mb} MB, into ${trash} — move any back to restore it`
    : `\n🔎 cleanup-dead-assets [PRF-3]: dry run — ${scan.dead.length} file(s), ${mb} MB. Re-run with --apply to move them into .hk/trash/`);
}
