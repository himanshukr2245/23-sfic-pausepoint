// scripts/lib/config.mjs — one hk.config.json drives every gate; any key you leave out falls back to these defaults.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const DEFAULTS = {
  app: { id: 'my-app', name: 'My App' },
  paths: { src: 'src', app: 'src/app', public: 'public', migrations: 'supabase/migrations' },
  assets: { dirs: ['public/art', 'public/brand'], exempt: ['public/brand/og-*', 'public/icons/**'], nameLists: [], maxTotalMB: 5, maxFileKB: 200, maxWidthPx: 860 },
  weight: { budgetKB: 1300, port: 3199, routes: [] },
  tokens: { scan: ['src'] },
  deploy: { npmVersion: '10.9.2' },                               // the npm Cloudflare Workers Builds runs `npm ci` with (verify-lock)
  live: { adminPath: '/hk-admin', decoys: ['/admin', '/wp-admin'], health: '/api/health', smoke: ['/'], expectNonceCsp: false, supabaseUrl: '' },
};

const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);

/** Objects merge key by key; arrays and scalars from `over` replace the default. */
export function deepMerge(base, over) {
  if (!isObj(base) || !isObj(over)) return over === undefined ? structuredClone(base) : structuredClone(over);
  const out = structuredClone(base);
  for (const [k, v] of Object.entries(over)) out[k] = isObj(v) && isObj(base[k]) ? deepMerge(base[k], v) : structuredClone(v);
  return out;
}

export function loadConfig(cwd = process.cwd()) {
  const file = join(cwd, 'hk.config.json');
  if (!existsSync(file)) return structuredClone(DEFAULTS);
  let user;
  try { user = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { throw new Error(`hk.config.json is not valid JSON: ${e.message}`); }
  if (!isObj(user)) throw new Error('hk.config.json must contain a JSON object');
  return deepMerge(DEFAULTS, user);
}

/** Minimal glob → RegExp for project-relative paths with forward slashes: ** = any depth, * = one segment, ? = one char. */
export function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') { i++; if (glob[i + 1] === '/') { re += '(?:.*/)?'; i++; } else re += '.*'; }
    else if (c === '*') re += '[^/]*';
    else if (c === '?') re += '[^/]';
    else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}
export const matchesAny = (relPath, globs = []) => globs.some((g) => globToRegExp(g).test(relPath.split('\\').join('/')));
