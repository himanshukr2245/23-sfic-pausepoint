// scripts/optimise-art.mjs — [PRF-3] resizes art to what the screen actually shows. Needs sharp (npm i -D sharp).
//   node scripts/measure-art-sizes.mjs http://127.0.0.1:3000   # first: writes .hk/art-sizes.json
//   node scripts/optimise-art.mjs --dry                        # preview
//   node scripts/optimise-art.mjs                              # rewrite files in place (originals are in git)
// Cap per image = min(assets.maxWidthPx, measured CSS width × 2). Never-seen images get maxWidthPx. Files in assets.exempt are skipped.
// Same format in, same format out (a .png stays a PNG). If re-encoding comes out bigger, the original is kept. Safe to re-run.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { relative } from 'node:path';
import { loadConfig, matchesAny } from './lib/config.mjs';
import { collect } from './lib/walk.mjs';

const DRY = process.argv.includes('--dry');
const DPR = 2, QUALITY = 80;
const cfg = loadConfig();
const a = cfg.assets;

let sharp;
try { sharp = (await import('sharp')).default; } catch { console.error('❌ optimise-art [PRF-3]: sharp is not installed — npm i -D sharp'); process.exit(1); }
const measured = existsSync('.hk/art-sizes.json') ? JSON.parse(readFileSync('.hk/art-sizes.json', 'utf8')) : null;
if (!measured) console.warn('⚠️  optimise-art: no .hk/art-sizes.json — every image gets the maxWidthPx cap. Run measure-art-sizes first for real caps.');

const encode = { '.png': (s) => s.png({ compressionLevel: 9 }), '.jpg': (s) => s.jpeg({ quality: QUALITY, mozjpeg: true }),
  '.jpeg': (s) => s.jpeg({ quality: QUALITY, mozjpeg: true }), '.webp': (s) => s.webp({ quality: QUALITY, effort: 6 }), '.avif': (s) => s.avif({ quality: 55 }) };
const files = collect(a.dirs, Object.keys(encode)).filter((f) => !matchesAny(relative('.', f), a.exempt));
let before = 0, after = 0;
const rows = [], unmeasured = [];

for (const file of files) {
  const url = '/' + relative(cfg.paths.public, file).split('\\').join('/');
  const source = readFileSync(file);                                // buffer first: sharp holds Windows files open lazily (EUNKNOWN on write-back)
  const { width = 0 } = await sharp(source).metadata();
  const seen = measured?.[url];
  if (!seen) unmeasured.push(url);
  const cap = Math.min(a.maxWidthPx, seen ? Math.ceil(seen.cssWidth * DPR) : a.maxWidthPx);
  before += source.length;
  if (width <= cap) { after += source.length; continue; }           // already small enough — never recompress
  const ext = file.slice(file.lastIndexOf('.')).toLowerCase();
  const out = await encode[ext](sharp(source).resize({ width: cap, withoutEnlargement: true })).toBuffer();
  if (out.length >= source.length) { after += source.length; continue; }   // never make anything worse
  rows.push({ url, from: source.length, to: out.length, fromW: width, toW: cap, guessed: !seen });
  after += out.length;
  if (!DRY) writeFileSync(file, out);
}

rows.sort((x, y) => (y.from - y.to) - (x.from - x.to));
console.log(`🪄 optimise-art [PRF-3]: ${DRY ? 'DRY RUN — nothing written' : 'resized in place'}`);
for (const r of rows.slice(0, 15)) console.log(`  ${(r.from / 1024).toFixed(0).padStart(6)} → ${(r.to / 1024).toFixed(0).padStart(5)} KB  ${r.url} (${r.fromW}→${r.toW}px${r.guessed ? ', capped' : ''})`);
if (rows.length > 15) console.log(`  … and ${rows.length - 15} more`);
console.log(`  ${rows.length} of ${files.length} image(s) resized · ${(before / 1048576).toFixed(2)} MB → ${(after / 1048576).toFixed(2)} MB`);
if (measured && unmeasured.length) console.log(`  ${unmeasured.length} image(s) never seen on screen were capped at ${a.maxWidthPx}px: ${unmeasured.slice(0, 10).join(', ')}${unmeasured.length > 10 ? ' …' : ''}`);
