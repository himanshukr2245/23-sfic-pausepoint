// scripts/lib/routes.mjs — every page route the app serves, read from the app dir instead of a list someone must remember to update.
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const PAGE = /^page\.(tsx|ts|jsx|js|mdx|md)$/;

/** Static routes only. (groups) add no URL segment; @slots, _private and (.)intercepting folders are not routes;
 *  [dynamic] segments are skipped — measuring a guessed URL that 404s would quietly understate the app's weight. */
export function discoverRoutes(appDir) {
  const out = [];
  const walk = (dir, segs) => {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    if (entries.some((e) => e.isFile() && PAGE.test(e.name))) out.push('/' + segs.join('/'));
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const n = e.name;
      if (n.startsWith('@') || n.startsWith('_') || n.startsWith('[') || /^\(\.+\)/.test(n)) continue;
      walk(join(dir, n), /^\(.+\)$/.test(n) ? segs : [...segs, n]);
    }
  };
  walk(appDir, []);
  return out;
}

/** Discovered static routes + the concrete URLs listed in hk.config.json weight.routes (e.g. "/games/memory-match" for a [slug] page). */
export function allRoutes(cfg, cwd = process.cwd()) {
  const app = join(cwd, cfg.paths.app);
  const found = existsSync(app) ? discoverRoutes(app) : [];
  const listed = (cfg.weight?.routes ?? []).filter((r) => typeof r === 'string' && r.startsWith('/'));
  return [...new Set([...found, ...listed])].filter((r) => r !== '/_not-found').sort();
}
