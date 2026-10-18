// .hk-template/hk-init.mjs — turns the hk-starter template into YOUR app, once. `npm run hk:init -- --help`
//   npm run hk:init -- --name "My App" --slug my-app --domain myapp.example.com --modules auth,offline --dry-run
// What it does (all planned in memory first; nothing is written if any step fails):
//  1. module markers (`// #if auth`, `{/* #if offline */}`, `# #if auth || offline` … `#endif`) in the allow-listed files:
//     kept or removed per your modules; the marker lines always go
//  2. variant files for your combination (which notes store), folders/files of modules you did not choose, their npm packages
//  3. renames: "HK Starter" → name, hk-starter → slug, starter.hkr.dpdns.org → domain, starter_ → <slug>_ (database objects)
//  4. a fresh README, STATUS, DECISIONS, IDEA (fill-in) and KICKOFF_PROMPT (for your AI) — and with --brand, the app's own colour
//     (light + dark tokens, each checked for ≥ 4.5:1 text contrast); then it deletes .hk-template/ (itself) and the template-only workflow
//  5. rewrites package-lock.json with the deploy's npm (scripts/verify-lock.mjs --fix) and checks nothing of the template is left
// Refuses to run on uncommitted changes (you could not undo it) unless --allow-dirty. `--check` only validates the template (CI).
import { existsSync, readFileSync, writeFileSync, rmSync, mkdirSync, readdirSync, statSync, renameSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const MODULES = ['auth', 'offline'];
const MARKER = /^\s*(?:\/\/|#|\{\/\*|<!--)\s*#(if|endif)\b\s*(.*?)\s*(?:\*\/\}|-->)?\s*$/;

/** Evaluate `auth && !offline`, `auth || offline`, `(a || b) && c` for the chosen modules. Throws on anything else. */
export function evaluate(expr, chosen) {
  const tokens = expr.match(/\s*(&&|\|\||!|\(|\)|[a-z]+)\s*/g)?.map((t) => t.trim()) ?? [];
  if (tokens.join('') !== expr.replace(/\s+/g, '')) throw new Error(`bad condition "${expr}"`);
  let i = 0;
  const atom = () => {
    const t = tokens[i++];
    if (t === '!') return !atom();
    if (t === '(') { const v = or(); if (tokens[i++] !== ')') throw new Error(`missing ) in "${expr}"`); return v; }
    if (!MODULES.includes(t)) throw new Error(`unknown module "${t}" in "${expr}" (known: ${MODULES.join(', ')})`);
    return chosen.includes(t);
  };
  const and = () => { let v = atom(); while (tokens[i] === '&&') { i++; v = atom() && v; } return v; };
  const or = () => { let v = and(); while (tokens[i] === '||') { i++; v = and() || v; } return v; };
  const value = or();
  if (i !== tokens.length) throw new Error(`bad condition "${expr}"`);
  return value;
}

/** Apply markers to one file's text. No nesting, every #if closed — anything else is an error naming the line. */
export function applyMarkers(text, chosen, file = 'file') {
  const out = [];
  let open = null;
  text.split('\n').forEach((line, n) => {
    const m = line.match(MARKER);
    if (m && m[1] === 'if') {
      if (open) throw new Error(`${file}:${n + 1}: #if inside #if (line ${open.line}) — markers do not nest`);
      if (!m[2]) throw new Error(`${file}:${n + 1}: #if without a condition`);
      open = { line: n + 1, keep: evaluate(m[2], chosen) };
    } else if (m && m[1] === 'endif') {
      if (!open) throw new Error(`${file}:${n + 1}: #endif without #if`);
      open = null;
    } else if (!open || open.keep) out.push(line);
  });
  if (open) throw new Error(`${file}:${open.line}: #if is never closed`);
  return out.join('\n');
}

export const hasMarkers = (text) => text.split('\n').some((l) => MARKER.test(l));

export function parseArgs(argv) {
  const a = { flags: new Set() };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (['--dry-run', '--yes', '--allow-dirty', '--check', '--help', '--skip-install'].includes(k)) a.flags.add(k.slice(2));
    else if (['--name', '--slug', '--domain', '--modules', '--description', '--brand'].includes(k)) a[k.slice(2)] = argv[++i];
    else throw new Error(`unknown option ${k} (see --help)`);
  }
  return a;
}

const opts_brand_invalid = (a) => a.brand !== undefined && !/^#[0-9a-fA-F]{6}$/.test(a.brand);

// ── brand colour: hex → OKLCH, and the WCAG contrast check every brand must pass behind its text colour ──
const toLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
export function hexToOklch(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => toLin(parseInt(hex.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}
function luminance({ L, C, h }) {
  const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
    .map((v) => Math.min(1, Math.max(0, v)));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}
export const contrast = (x, y) => { const [p, q] = [luminance(x), luminance(y)].sort((u, v) => v - u); return (p + 0.05) / (q + 0.05); };
const fmt = ({ L, C, h }) => `oklch(${L.toFixed(2)} ${C.toFixed(2)} ${Math.round(h)})`;
/** The two brand tokens for a hex colour: light (darkened until white text reaches 4.5:1) and dark (lightened until dark text does). */
export function brandTokens(hex) {
  const base = hexToOklch(hex);
  const C = Math.min(base.C, 0.22);
  let light = { L: Math.min(base.L, 0.62), C, h: base.h };
  while (contrast(light, { L: 0.99, C: 0, h: 0 }) < 4.5 && light.L > 0.2) light = { ...light, L: light.L - 0.01 };
  let dark = { L: Math.max(base.L, 0.72), C: Math.min(C, 0.18), h: base.h };
  while (contrast(dark, { L: 0.12, C: 0.02, h: 260 }) < 4.5 && dark.L < 0.95) dark = { ...dark, L: dark.L + 0.01 };
  return { light: fmt(light), dark: fmt(dark), lightRatio: contrast(light, { L: 0.99, C: 0, h: 0 }), darkRatio: contrast(dark, { L: 0.12, C: 0.02, h: 260 }) };
}

export function validate({ name, slug, domain, modules, description }) {
  const errors = [];
  if (!name || name.length > 60 || /["'`\\<>]/.test(name)) errors.push('--name: 1–60 characters, no quotes, backslashes or < >');
  if (!slug || !/^[a-z][a-z0-9-]{1,38}[a-z0-9]$/.test(slug) || slug.includes('--')) errors.push('--slug: 3–40 of a-z 0-9 -, starting with a letter (it becomes the Worker and package name)');
  if (!domain || !/^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)) errors.push('--domain: a hostname like notes.example.com (no https://)');
  const list = modules === undefined ? null : modules === 'none' || modules === '' ? [] : modules.split(',').map((s) => s.trim());
  if (!list || list.some((m) => !MODULES.includes(m))) errors.push(`--modules: none, or a comma list of ${MODULES.join(', ')}`);
  if (opts_brand_invalid(arguments[0])) errors.push('--brand: a hex colour like #0ea5e9');
  if (description && (description.length > 160 || /["'`\\<>]/.test(description))) errors.push('--description: up to 160 characters, no quotes, backslashes or < >');
  return { errors, chosen: [...new Set(list ?? [])].sort() };
}

const listFiles = (root) => {
  const r = spawnSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' });
  if (r.status !== 0) throw new Error('git ls-files failed — run hk:init inside the repository');
  return r.stdout.split('\0').filter(Boolean);
};
const TEXT = /\.(m?[jt]sx?|json|jsonc|md|mdx|ya?ml|css|html|sql|txt|toml)$|^\.env\.example$|(^|\/)\.[a-z]+$/i;

/** The whole change, computed without touching the disk: { writes: Map(path → text), removes: [], renames: [[from, to]] }. */
export function plan(root, opts) {
  const manifest = JSON.parse(readFileSync(join(root, '.hk-template', 'manifest.json'), 'utf8'));
  const { name, slug, domain, chosen } = opts;
  const description = opts.description || `${name} — built from hk-starter.`;
  const prefix = slug.replace(/-/g, '_');
  const writes = new Map();
  const read = (p) => writes.get(p) ?? readFileSync(join(root, p), 'utf8');
  const removes = new Set(manifest.alsoRemove);
  const gone = (p) => [...removes].some((r) => p === r || p.startsWith(r + '/'));

  for (const f of manifest.markerFiles) writes.set(f, applyMarkers(read(f), chosen, f));
  if (opts.brand) {
    const css = 'src/app/globals.css';
    const { light, dark } = brandTokens(opts.brand);
    let n = 0;
    const next = read(css).replace(/--color-brand: oklch\([^)]*\);/g, (m) => (++n === 1 ? `--color-brand: ${light};` : n === 2 ? `--color-brand: ${dark};` : m));
    if (n < 2) throw new Error('globals.css: expected a light and a dark --color-brand token');
    writes.set(css, next);
  }
  for (const r of manifest.remove) if (!evaluate(r.unless, chosen)) r.paths.forEach((p) => removes.add(p));
  for (const v of manifest.variants) {
    if (!evaluate(v.when, chosen)) continue;
    const base = join(root, '.hk-template', v.from);
    const walk = (dir) => readdirSync(dir).flatMap((e) => (statSync(join(dir, e)).isDirectory() ? walk(join(dir, e)) : [join(dir, e)]));
    for (const abs of walk(base)) { const p = relative(base, abs).replaceAll('\\', '/'); writes.set(p, readFileSync(abs, 'utf8')); removes.delete(p); }
  }

  // package.json: name, description, packages of removed modules, no hk:init script
  const pkg = JSON.parse(read('package.json'));
  pkg.name = slug;
  pkg.description = description;
  for (const d of manifest.dependencies) if (!evaluate(d.unless, chosen)) for (const n of d.names) { delete pkg.dependencies?.[n]; delete pkg.devDependencies?.[n]; }
  delete pkg.scripts['hk:init'];
  writes.set('package.json', JSON.stringify(pkg, null, 2) + '\n');

  // hk.config.json: smoke paths of removed modules, the app's identity
  const cfg = JSON.parse(read('hk.config.json'));
  const dropSmoke = new Set(manifest.smoke.filter((s) => !evaluate(s.unless, chosen)).flatMap((s) => s.paths));
  cfg.live.smoke = cfg.live.smoke.filter((p) => !dropSmoke.has(p));
  cfg.app = { id: slug, name };
  delete cfg.licences;                                            // every new app makes its own font-licence decision (check-licences)
  writes.set('hk.config.json', JSON.stringify(cfg, null, 2) + '\n');

  // tsconfig: the variants folder is gone after init
  const ts = read('tsconfig.json');
  writes.set('tsconfig.json', ts.replace(/\s*"\.hk-template\/variants\/\*\*\/\*\.ts",?/, ''));

  const today = new Date().toISOString().slice(0, 10);
  const modulesText = chosen.length ? chosen.join(' + ') : 'none (core only)';
  writes.set('README.md', readme({ name, domain, description, chosen, modulesText }));
  writes.set('docs/STATUS.md', `# STATUS — ${name}\nUpdated: ${today} · Phase: S0 — created from hk-starter (modules: ${modulesText})\nLive: not deployed yet · Last green tag: none\n\n## Next\n- Push to GitHub, connect Cloudflare Workers Builds, add the custom domain ${domain} (README → First deploy).\n- \`npm run check:live -- https://${domain} --expect-head\` after the first deploy.\n\n## Known bugs\n- none known\n\n## Simulated (must be labelled in UI + docs)\n- none\n`);
  writes.set('docs/IDEA.md', `# IDEA — ${name}\nFill this in BEFORE asking an AI to build anything (10 minutes). Keep every answer to one or two lines.\n\n## Who is it for?\n- \n\n## The one job it does for them\n- \n\n## Golden path — the 3 beats that must always work (they become e2e/golden-path.spec.ts)\n1. \n2. \n3. \n\n## The data it keeps (and who may see it)\n- \n\n## Modules\n- ${modulesText}\n\n## Look and feel\n- Brand colour: ${opts.brand ?? 'the template default'} · mood (3 words): \n\n## Out of scope for v1\n- \n`);
  writes.set('docs/KICKOFF_PROMPT.md', `# Kickoff prompt — paste this to your AI after filling docs/IDEA.md\n\n\`\`\`text\nBuild ${name}: ${description}\nThis repo was created from the hk-starter template (modules: ${modulesText}) and follows the HK Universal Library v3.\nBefore writing code:\n1. Read AGENTS.md completely — especially "Design system" and "Laws for the AI".\n2. Read docs/IDEA.md, then write a phase plan (3–6 phases, each with its own golden-path beat and tests) into docs/plans/ and wait for my OK.\nWhile building:\n3. Use the existing components (src/components/ui, Button/ButtonLink, GlassCard, the card pattern) and only the colour tokens — never raw colours, never <Link><Button>.\n4. Keep notes/auth/offline modules as they are unless the plan says otherwise.\n5. After every task run npm run check:fast; at the end of every phase run npm run check and paste the real output.\n6. Never claim anything on screen that is not measured or true (check-honesty).\n\`\`\`\n`);
  writes.set('docs/DECISIONS.md', `# DECISIONS — one line each, newest first\n- ${today} — Created from hk-starter with modules: ${modulesText}. Its decisions (nonce CSP, deploy by git push, zod/mini, last write wins enforced in the database) carry over — see the template's history.\n`);
  const agents = read('AGENTS.md').replace(/## Mission\n[\s\S]*?\n(?=## )/, `## Mission\n${description}\nKind: PRODUCT · Modules: ${modulesText} · Live: https://${domain} · Status: \`docs/STATUS.md\`.\n<!-- Replace with: who it is for, the one job it does, and what "done" looks like. -->\n\n`);
  writes.set('AGENTS.md', agents);

  // renames in every remaining text file (and file names that carry the table prefix)
  const RENAMES = [['HK Starter', name], ['starter.hkr.dpdns.org', domain], ['hk-starter', slug], ['starter_', `${prefix}_`]];
  const swap = (t) => RENAMES.reduce((acc, [from, to]) => acc.split(from).join(to), t);
  const renames = [];
  for (const p of listFiles(root)) {
    if (gone(p) || p === 'package-lock.json' || !TEXT.test(p) || [...removes].some((r) => p === r || p.startsWith(r + '/'))) continue;
    const text = read(p);
    const next = swap(text);
    if (next !== text || writes.has(p)) writes.set(p, next);
  }
  for (const p of [...writes.keys()]) if (p.includes('starter_')) { renames.push([p, p.split('starter_').join(`${prefix}_`)]); }
  for (const p of [...writes.keys()]) if (gone(p) || [...removes].some((r) => p === r || p.startsWith(r + '/'))) writes.delete(p);
  return { writes, removes: [...removes], renames };
}

function readme({ name, domain, description, chosen, modulesText }) {
  const auth = chosen.includes('auth');
  return `# ${name}

${description}

- **Live:** https://${domain}
- **Built from:** hk-starter (modules: ${modulesText}) · house standard: HK Universal Library v3 (\`2-Plans/universal/00_START_HERE.md\`)
- **Status:** \`docs/STATUS.md\` · **AI brain:** \`AGENTS.md\`

## Daily work
1. \`npm run dev\` — opens http://127.0.0.1:3000 (you run it; it is not started for you).
2. \`npm run check:fast\` after every change; \`npm run check\` before you push.
3. Deploy = \`git push\` → Cloudflare Workers Builds. Never \`npm run deploy\` from Windows.

## First deploy
1. Publish the repository to GitHub (GitHub Desktop → Publish repository).
2. Cloudflare → Workers & Pages → Create → Import a repository → this repo · build command \`npx opennextjs-cloudflare build\` · deploy command \`npx wrangler deploy\` · root \`/\`.
3. The Worker → Settings → Domains & Routes → Add → Custom domain → \`${domain}\`.
4. Build variable \`NEXT_PUBLIC_SITE_URL\` = \`https://${domain}\`${auth ? ', plus the two Supabase values from `docs/SUPABASE_SETUP.md`' : ''}.
5. \`npm run check:live -- https://${domain} --expect-head\` — green means the live site runs your commit and passes the security checks.
${auth ? '\n## Accounts\nGuest mode (notes on the device, no sign-in) until you follow `docs/SUPABASE_SETUP.md`.\n' : ''}
## The gate ladder
| Command | When | Checks |
|---|---|---|
| \`npm run check:fast\` | after every task | route types + \`tsc\`, ESLint, secrets, design tokens |
| \`npm run check\` | end of every phase | fast + RLS, honesty, assets, unit tests, build, dynamic rendering, end-to-end tests |
| \`npm run check:release\` | before a release | check + dependency audit, bundle leaks, route weight, deploy preflight, FACTS |
| \`npm run check:live -- <url> --expect-head\` | after every deploy | the live site runs your commit · headers, nonce CSP, health, hidden paths, smoke routes |
`;
}

/** --check (template CI): markers valid and only in allow-listed files, manifest paths and variants exist. */
export function checkTemplate(root) {
  const manifest = JSON.parse(readFileSync(join(root, '.hk-template', 'manifest.json'), 'utf8'));
  const problems = [];
  const allowed = new Set(manifest.markerFiles);
  for (const p of listFiles(root)) {
    if (!TEXT.test(p) || p.startsWith('.hk-template/') || !existsSync(join(root, p))) continue;
    const text = readFileSync(join(root, p), 'utf8');
    if (!hasMarkers(text)) continue;
    if (!allowed.has(p)) { problems.push(`${p}: has #if markers but is not in manifest.markerFiles`); continue; }
    for (const combo of [[], ['auth'], ['offline'], ['auth', 'offline']]) {
      try { applyMarkers(text, combo, p); } catch (e) { problems.push(e.message); break; }
    }
  }
  for (const f of manifest.markerFiles) if (!existsSync(join(root, f))) problems.push(`markerFiles: ${f} does not exist`);
  for (const r of manifest.remove) for (const p of r.paths) if (!existsSync(join(root, p))) problems.push(`remove: ${p} does not exist`);
  for (const v of manifest.variants) if (!existsSync(join(root, '.hk-template', v.from))) problems.push(`variants: ${v.from} does not exist`);
  return problems;
}

async function main() {
  const root = process.cwd();
  let args;
  try { args = parseArgs(process.argv.slice(2)); } catch (e) { console.error(`❌ ${e.message}`); process.exit(2); }
  if (args.flags.has('help')) {
    console.log('npm run hk:init -- --name "My App" --slug my-app --domain myapp.example.com --modules auth,offline [--brand "#0ea5e9"] [--description "…"] [--dry-run] [--yes]\n  --modules: none | auth | offline | auth,offline');
    return;
  }
  if (!existsSync(join(root, '.hk-template', 'manifest.json'))) { console.error('❌ hk:init: this app was already initialised (.hk-template/ is gone).'); process.exit(1); }
  if (args.flags.has('check')) {
    const problems = checkTemplate(root);
    if (problems.length) { console.error(`❌ hk:init --check: ${problems.length} problem(s)\n   • ${problems.join('\n   • ')}`); process.exit(1); }
    console.log('✅ hk:init --check: markers, manifest and variants are valid for all 4 module combinations');
    return;
  }
  const { errors, chosen } = validate(args);
  if (errors.length) { console.error(`❌ hk:init:\n   • ${errors.join('\n   • ')}\n   (npm run hk:init -- --help)`); process.exit(2); }
  const dirty = spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).stdout.trim();
  if (dirty && !args.flags.has('allow-dirty')) { console.error('❌ hk:init: commit or stash your changes first — then the whole init can be undone with git.'); process.exit(1); }

  const p = plan(root, { ...args, chosen });
  console.log(`hk:init → ${args.name} (${args.slug}) at https://${args.domain} · modules: ${chosen.join(', ') || 'none'}`);
  console.log(`  write ${p.writes.size} file(s) · remove ${p.removes.length} path(s) · rename ${p.renames.length} file(s)`);
  for (const r of p.removes) console.log(`  - ${r}`);
  for (const [a, b] of p.renames) console.log(`  ~ ${a} → ${b}`);
  if (args.flags.has('dry-run')) { console.log('(dry run — nothing was changed)'); return; }
  if (!args.flags.has('yes')) {
    const { createInterface } = await import('node:readline/promises');
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = (await rl.question('Apply these changes? (yes/no) ')).trim().toLowerCase();
    rl.close();
    if (answer !== 'yes' && answer !== 'y') { console.log('Nothing changed.'); return; }
  }

  for (const [path, text] of p.writes) { mkdirSync(dirname(join(root, path)), { recursive: true }); writeFileSync(join(root, path), text); }
  for (const [from, to] of p.renames) if (existsSync(join(root, from))) renameSync(join(root, from), join(root, to));
  for (const r of p.removes) rmSync(join(root, r), { recursive: true, force: true });

  if (!args.flags.has('skip-install')) {
    const lock = spawnSync(process.execPath, ['scripts/verify-lock.mjs', '--fix'], { cwd: root, stdio: 'inherit' });
    if (lock.status !== 0) console.error('⚠️  hk:init: the lockfile could not be rewritten — run `npm run lock`, then `npm install`.');
  }
  const leftovers = listFiles(root).filter((f) => existsSync(join(root, f)) && TEXT.test(f) && f !== 'package-lock.json')
    .filter((f) => { const t = readFileSync(join(root, f), 'utf8'); return hasMarkers(t) || /HK Starter|starter\.hkr\.dpdns\.org/.test(t); });
  if (leftovers.length) console.error(`⚠️  hk:init: template text left in: ${leftovers.join(', ')} — review them.`);
  const fontDir = join(root, 'public', 'fonts');
  if (existsSync(fontDir)) for (const f of readdirSync(fontDir)) if (/personal|demo/i.test(f)) console.error(`⚠️  hk:init: public/fonts/${f} has a personal-use / demo licence — buy a licence or replace it before commercial use (AGENTS.md → Design system).`);
  console.log(`✅ hk:init: done. Next: npm run check → git add -A → git commit -m "chore: init ${args.slug} from hk-starter" → push.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main();
