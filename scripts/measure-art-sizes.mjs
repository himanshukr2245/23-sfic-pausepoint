// scripts/measure-art-sizes.mjs — [PRF-3] records how wide each image is ACTUALLY drawn, on every route, at phone and tablet widths.
//   node scripts/measure-art-sizes.mjs http://127.0.0.1:3000      (a running `next start` or preview)
// Writes .hk/art-sizes.json: "/art/x.webp" → the largest CSS width it is ever rendered at. optimise-art.mjs then caps each file at twice
// that — all a 2× phone screen can resolve. Measured, never guessed: Smriti shipped ~20× more pixels than any screen showed.
// Needs Chrome or Edge (set CHROME_PATH if it is somewhere unusual).
import { writeFileSync, mkdirSync } from 'node:fs';
import { loadConfig } from './lib/config.mjs';
import { allRoutes } from './lib/routes.mjs';
import { launch, sleep } from './lib/browser.mjs';

const WIDTHS = [390, 430, 768];
const base = (process.argv[2] ?? 'http://127.0.0.1:3000').replace(/\/+$/, '');
const cfg = loadConfig();

/** Every same-origin image's rendered box, including CSS backgrounds. */
const COLLECT = `(() => {
  const seen = [];
  const add = (src, box) => { try { const u = new URL(src, location.href); if (u.origin === location.origin && box.width >= 1) seen.push({ src: u.pathname, w: box.width, h: box.height }); } catch {} };
  for (const img of document.images) add(img.currentSrc || img.src, img.getBoundingClientRect());
  for (const el of document.querySelectorAll('*')) {
    const m = getComputedStyle(el).backgroundImage.match(/url\\(["']?([^"')]+)["']?\\)/);
    if (m) add(m[1], el.getBoundingClientRect());
  }
  return JSON.stringify(seen);
})()`;

const routes = allRoutes(cfg);
const widest = new Map();
let failed = 0, browser;
try {
  browser = await launch({ profile: 'measure' });
  console.log(`📏 measure-art-sizes [PRF-3]: ${routes.length} route(s) at ${WIDTHS.join(', ')} px`);
  for (const width of WIDTHS) {
    await browser.viewport(width);
    for (const route of routes) {
      try { await browser.goto(base + route); } catch (e) { failed++; console.warn(`  skipped ${route} at ${width}px — ${e.message}`); continue; }
      await browser.evaluate('window.scrollTo(0, document.documentElement.scrollHeight); 0');   // lay out lazy images too
      await sleep(400);
      for (const hit of JSON.parse(await browser.evaluate(COLLECT))) {
        const name = decodeURIComponent(hit.src), prev = widest.get(name);
        if (!prev || hit.w > prev.w) widest.set(name, { w: Math.ceil(hit.w), h: Math.ceil(hit.h), route, width });
      }
    }
  }
} catch (e) { console.error(`❌ measure-art-sizes [PRF-3]: ${e.message}`); process.exitCode = 1; }
finally { if (browser) await browser.close(); }

if (!process.exitCode) {
  const manifest = Object.fromEntries([...widest].sort(([a], [b]) => a.localeCompare(b))
    .map(([path, i]) => [path, { cssWidth: i.w, cssHeight: i.h, seenOn: i.route, atViewport: i.width }]));
  mkdirSync('.hk', { recursive: true });
  writeFileSync('.hk/art-sizes.json', JSON.stringify(manifest, null, 2) + '\n');
  console.log(`  ${Object.keys(manifest).length} image(s) measured → .hk/art-sizes.json`);
  if (failed) console.log(`  ${failed} route render(s) failed — images only used there keep the maxWidthPx cap`);
  for (const [path, i] of Object.entries(manifest).sort((a, b) => b[1].cssWidth - a[1].cssWidth).slice(0, 8)) console.log(`  ${String(i.cssWidth).padStart(5)}px  ${path}`);
}
