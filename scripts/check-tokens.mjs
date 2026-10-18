// scripts/check-tokens.mjs — [BLD-4] every colour comes from the design system (globals.css @theme tokens), not raw values in components.
//   node scripts/check-tokens.mjs           → raw hex / rgb() / hsl() / oklch() in hk.config.json tokens.scan (default src)
//   node scripts/check-tokens.mjs --built   → ALSO checks, after `next build`, that every Tailwind colour utility and fractional
//                                             spacing class you wrote was generated (Tailwind silently drops `bg-brnd` or `py-0.2`)
//   Tailwind PALETTE classes count as raw colours too (bg-emerald-500, text-white, border-black/10): any shade number, white/black,
//   or a palette name your @theme does not define. Your own tokens (bg-cyan when --color-cyan exists, text-cyan-fg) pass.
//   The tokens are read from tokens.cssFile (default src/app/globals.css).
// Escape hatches: "tokens-ok" on a line, or "tokens-ok-file: <reason>" in a file (e.g. a colour picker whose colours ARE its data).
// A file opt-out without a reason fails, and every opted-out file is listed — a silent mass opt-out once hid 74 raw colours.
import { readFileSync, existsSync } from 'node:fs';
import { loadConfig } from './lib/config.mjs';
import { collect, report } from './lib/walk.mjs';

// not after a word char or & — so "repo#1309" and "&#039;" are not colours; comment-only lines are skipped below
const RAW = /(?<![\w&])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(\s*[\d.]/;
const COMMENT = /^\s*(\/\/|\/\*|\*)/;
const PALETTE = 'white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const CLASS = new RegExp(`(?<![\\w-])((?:[a-z0-9-]+:)*(?:bg|text|border|from|via|to|ring|shadow|fill|stroke|outline|decoration|divide|placeholder|caret|accent)(?:-[xytrbl])?-(${PALETTE})(?:-(\\d{2,3}))?(?:\\/\\d+)?)(?![\\w-])`, 'g');
const cfg = loadConfig();
const files = collect(cfg.tokens.scan, ['.tsx', '.jsx', '.ts', '.js']);
const cssFile = cfg.tokens.cssFile ?? 'src/app/globals.css';
const defined = new Set(existsSync(cssFile) ? [...readFileSync(cssFile, 'utf8').matchAll(/--color-([a-z0-9-]+)\s*:/g)].map((m) => m[1]) : []);
const problems = [], warnings = [];

for (const f of files) {
  const text = readFileSync(f, 'utf8');
  if (text.includes('tokens-ok-file')) {
    const why = text.match(/tokens-ok-file:\s*([^\n*]{10,}?)\s*(?:\*\/|$)/m)?.[1];
    if (why) warnings.push(`${f} opts out of the token check: ${why.trim()}`);
    else problems.push(`${f}: tokens-ok-file needs a reason — "tokens-ok-file: <why raw colours are right here>" (or use tokens)`);
    continue;
  }
  text.split('\n').forEach((line, i) => {
    if (COMMENT.test(line) || line.includes('tokens-ok')) return;
    const m = line.match(RAW);
    if (m) problems.push(`${f}:${i + 1} → raw colour "${m[0]}…" — use a design token instead`);
    for (const [, cls, name, shade] of line.matchAll(CLASS)) {
      if (shade || !defined.has(name)) problems.push(`${f}:${i + 1} → raw palette colour "${cls}" — use a design token (add one to ${cssFile} @theme if it is missing)`);
    }
  });
}

if (process.argv.includes('--built')) {
  const css = collect(['.next/static'], ['.css']).map((f) => readFileSync(f, 'utf8')).join('\n');
  if (!css) problems.push('--built: no CSS under .next/static — run `next build` first');
  else {
    const used = new Map();
    const COLOUR = /["'`\s]((?:[a-z0-9-]+:)*(?:bg|text|border|fill|stroke|ring|shadow)-[a-z][a-z0-9-]*(?:\/\d+)?)(?=["'`\s])/g;
    const SPACING = /["'`\s]((?:[a-z0-9-]+:)*-?(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y|w|h|size|inset|top|left|right|bottom)-\d+\.\d+)(?=["'`\s])/g;
    for (const f of files.filter((x) => !/\.(test|spec)\./.test(x))) {
      const src = readFileSync(f, 'utf8');
      for (const re of [COLOUR, SPACING]) for (const [, cls] of src.matchAll(re)) if (!used.has(cls)) used.set(cls, f);
    }
    // Tailwind escapes ":" "." and "/" in selectors: sm:pt-1.5 → .sm\:pt-1\.5 — look for the escaped form or a variant-only use is a false miss
    for (const [cls, f] of used) {
      const sel = '.' + cls.replace(/[.:/]/g, (c) => '\\' + c);
      if (!css.includes(sel)) problems.push(`${f} → "${cls}" produced no CSS (unknown token, or a spacing step off the .5 scale) — it silently does nothing`);
    }
  }
}
if (!existsSync(cfg.tokens.scan[0] ?? 'src')) console.log(`⏭️  check-tokens: ${cfg.tokens.scan.join(', ')} not found — nothing to scan`);
report('check-tokens', 'BLD-4', problems, warnings);
