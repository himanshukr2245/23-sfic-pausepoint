// scripts/check-honesty.mjs — [BLD-10] blocks claims a sharp judge, reviewer or regulator can destroy in one question.
// Universal defaults below + app-specific bans in honesty.config.json:
//   { "scan": ["src", "README.md", "docs/pitch"],
//     "banned": [{ "pattern": "diagnos(e|is|es)", "why": "We are not a medical device" }] }
// Escape hatch for a line that legitimately needs the word: add "honesty-ok".
import { readFileSync, existsSync } from 'node:fs';
import { basename } from 'node:path';
import { collect, report } from './lib/walk.mjs';

const DEFAULT_BANS = [
  ['\\bguarantee[ds]?\\b', 'Nothing is guaranteed — state what you measured'],
  ['\\b100\\s?% (secure|safe|accurate|reliable|uptime)\\b', 'Absolute claims invite attack'],
  ['\\bunhackable\\b|\\bmilitary[- ]grade\\b|\\bbank[- ]grade\\b', 'Marketing phrases judges distrust'],
  ['\\bzero (bugs|latency|risk|downtime)\\b|\\b0\\s?ms\\b', 'Physically untrue — say "no network wait" or give the measured number'],
  ['\\bcryptographic(ally)?\\s+(row|rls|multi-?tenan|isolation)', 'RLS is policy-based access control, not cryptography'],
  ['\\bformal(ly)?\\s+(method|verification|proof|verified)\\b', 'Only if a real formal verifier is involved'],
  ['\\bclinically\\s+(proven|validated|tested)\\b', 'Requires a clinical study you can cite'],
  ['\\bimmun(e|ity)\\b', 'No system is immune — name the specific protection and what it blocks'],
  ['zero vulnerabilit', 'Nobody can show zero vulnerabilities — say what was tested and when'],
  ['healing (tone|frequency|sound)', 'No evidence base for sound-healing claims'],
  ['super[- ]duper', 'Hype, not a fact — state the measured benefit'],
];

const problems = [];
let cfg = {};
if (existsSync('honesty.config.json')) {
  try { cfg = JSON.parse(readFileSync('honesty.config.json', 'utf8')); } catch (e) { problems.push(`honesty.config.json is not valid JSON: ${e.message}`); }
}
const bans = [];
for (const [p, why] of [...DEFAULT_BANS, ...(cfg.banned || []).map((b) => [b.pattern, b.why])]) {
  try { bans.push([new RegExp(p, 'i'), why]); } catch (e) { problems.push(`honesty.config.json: invalid pattern ${JSON.stringify(p)} — ${e.message}`); }
}
const scan = cfg.scan || ['src', 'README.md', 'docs/pitch'];

for (const f of collect(scan, ['.tsx', '.jsx', '.ts', '.js', '.md', '.mdx', '.json'])) {
  if (basename(f) === 'honesty.config.json') continue;                 // the ban list itself
  readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    if (line.includes('honesty-ok')) return;
    for (const [re, why] of bans) {
      const m = line.match(re);
      if (m) problems.push(`${f}:${i + 1} → "${m[0]}" — ${why}`);
    }
  });
}
report('check-honesty', 'BLD-10', problems);
