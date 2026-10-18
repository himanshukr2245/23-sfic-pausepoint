// scripts/lib/assets.mjs — one scan shared by check-assets and cleanup-dead-assets: what the code references vs what is on disk.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { collect } from './walk.mjs';
import { matchesAny } from './config.mjs';

// The extension must END there: "/manifest.webmanifest" is not "/manifest.webm" (a false "missing file" from a service worker once).
export const REF = /["'`(](\/[^"'`()\s?#]+\.(?:png|jpe?g|webp|avif|gif|svg|ico|mp3|m4a|wav|ogg|mp4|webm|woff2?|ttf|otf|pdf))(?![\w.-])/g;
const CODE_EXT = ['.tsx', '.jsx', '.ts', '.js', '.mjs', '.css', '.scss', '.md', '.mdx', '.json', '.html'];
const PUBLIC_TEXT_EXT = ['.webmanifest', '.json', '.js', '.css', '.html', '.txt', '.xml'];   // manifest icons, service-worker precache lists
const posix = (p) => p.split(sep).join('/');
const decode = (s) => { try { return decodeURIComponent(s); } catch { return s; } };

/** Values of a constant in a source file: `NAME = ['a', 'b']` (array) or `NAME = "a"` (single string), typed or `as const`. */
export function readNameList(source, constant) {
  const m = new RegExp(`\\b${constant}\\b\\s*(?::[^=\\n]*)?=\\s*`).exec(source);
  if (!m) return null;
  const at = m.index + m[0].length;
  const body = source[at] === '[' ? source.slice(at, source.indexOf(']', at)) : source.slice(at).match(/^(["'`])[^"'`]*\1/)?.[0];
  if (!body) return null;
  return [...body.matchAll(/(["'`])([^"'`$\n]+)\1/g)].map((x) => x[2]);
}

/** Exact-case existence check: Windows finds /Art/Hero.webp for /art/hero.webp, Cloudflare's asset lookup does not. */
function makeExists(root) {
  const cache = new Map();
  const list = (d) => { if (!cache.has(d)) { try { cache.set(d, new Set(readdirSync(d))); } catch { cache.set(d, new Set()); } } return cache.get(d); };
  return (url) => {
    let dir = root;
    for (const seg of url.split('/').filter(Boolean)) { if (!list(dir).has(seg)) return existsSync(join(root, url)) ? 'case' : false; dir = join(dir, seg); }
    return true;
  };
}

export function scanAssets(cfg, cwd = process.cwd()) {
  const abs = (p) => join(cwd, p), rel = (f) => posix(relative(cwd, f));
  const pub = abs(cfg.paths.public);
  const referenced = new Map(), configErrors = [];
  const add = (url, where) => { if (!referenced.has(url)) referenced.set(url, where); };

  for (const f of [...collect(abs(cfg.paths.src), CODE_EXT), ...collect(pub, PUBLIC_TEXT_EXT)]) {
    for (const [, ref] of readFileSync(f, 'utf8').matchAll(REF)) {
      if (ref.includes('${') || ref.startsWith('/_next/') || ref.startsWith('//')) continue;
      add(decode(ref), rel(f));
    }
  }
  // Template paths (`/art/objects/${face}.webp`) are resolved from named lists, never guessed from every string in the file.
  for (const { file, constant, template } of cfg.assets.nameLists ?? []) {
    const names = existsSync(abs(file)) ? readNameList(readFileSync(abs(file), 'utf8'), constant) : null;
    if (!names) { configErrors.push(`assets.nameLists: ${constant} not found in ${file} — fix hk.config.json (dead-file results would be wrong)`); continue; }
    for (const name of names) add(template.replaceAll('{name}', name), `${file} (${constant})`);
  }

  const exists = makeExists(pub);
  const missing = [];
  for (const [url, where] of referenced) { const e = exists(url); if (e !== true) missing.push({ url, where, caseOnly: e === 'case' }); }

  const files = collect(cfg.assets.dirs.map(abs)).map((f) => {
    const r = posix(relative(pub, f));
    return { file: f, rel: rel(f), url: r.startsWith('..') ? null : '/' + r, bytes: statSync(f).size, exempt: matchesAny(rel(f), cfg.assets.exempt) };
  });
  const dead = files.filter((a) => !a.exempt && a.url && !referenced.has(a.url));
  const totalBytes = files.reduce((n, a) => n + a.bytes, 0);
  return { referenced, missing, files, dead, totalBytes, configErrors };
}
