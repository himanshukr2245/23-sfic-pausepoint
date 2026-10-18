// scripts/check-licences.mjs — [PRF-4] a font file whose name says "personal use", "demo" or "trial" must not ship in a release
// unless you decided about it on purpose: hk.config.json → licences.acknowledged: [{ "file": "public/fonts/X.woff", "note": "why" }].
// Template lesson: a personal-use display font sat in the starter every new app inherits — commercial apps would ship it.
//   node scripts/check-licences.mjs        (in check:release)
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadConfig } from './lib/config.mjs';
import { report } from './lib/walk.mjs';

const cfg = loadConfig();
const dirs = cfg.licences?.dirs ?? ['public/fonts'];
const acknowledged = new Map((cfg.licences?.acknowledged ?? []).map((a) => [String(a.file).replaceAll('\\', '/'), String(a.note ?? '').trim()]));
const RESTRICTED = /personal|demo|trial|non[-_ ]?commercial/i;
const problems = [], warnings = [];

for (const dir of dirs) {
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir)) {
    if (!RESTRICTED.test(name)) continue;
    const file = join(dir, name).replaceAll('\\', '/');
    const note = acknowledged.get(file);
    if (note && note.length >= 10) warnings.push(`${file} has a restricted licence — acknowledged: ${note}`);
    else problems.push(`${file} looks like a personal-use / demo font — buy a licence or replace it, or record the decision in hk.config.json licences.acknowledged [{ file, note }]`);
  }
}
report('check-licences', 'PRF-4', problems, warnings);
