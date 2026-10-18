// scripts/check-bundle.mjs — [SEC-2] run AFTER a production build. Proves that nothing secret reached the client.
// Scans everything a browser or an APK can download: .next/static, the OpenNext static assets, out/, dist/, build/, and the Capacitor web assets.
//  1. exact VALUES of every non-public variable in your .env files / .dev.vars (the check nothing else does)
//  2. known secret patterns
//  3. source maps (.map files / sourceMappingURL comments) unless --allow-maps
import { readFileSync, existsSync } from 'node:fs';
import { collect, report } from './lib/walk.mjs';

const CLIENT_DIRS = ['.next/static', '.open-next/assets', 'out', 'dist', 'build', 'android/app/src/main/assets/public'];
const PUBLIC_PREFIX = /^(NEXT_PUBLIC_|VITE_|PUBLIC_|EXPO_PUBLIC_)/;
const allowMaps = process.argv.includes('--allow-maps');

// 1) collect private values from local env files (never printed — only their names)
const secrets = [];
for (const f of ['.env', '.env.local', '.env.production', '.env.production.local', '.dev.vars']) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || PUBLIC_PREFIX.test(m[1])) continue;
    const value = m[2].trim().replace(/^['"]|['"]$/g, '');
    if (value.length >= 8 && !/^(true|false|development|production|localhost)$/i.test(value)) secrets.push({ name: m[1], value });
  }
}
const PATTERNS = [
  [/gsk_[A-Za-z0-9]{20,}/, 'Groq API key'], [/\bsk-(?:proj-|ant-)?[A-Za-z0-9_\-]{20,}/, 'OpenAI / Anthropic-style key'],
  [/\bsb_secret_[A-Za-z0-9_\-]{10,}/, 'Supabase secret key'], [/\bgh[pousr]_[A-Za-z0-9]{36,}/, 'GitHub token'],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'Private key block'],
];
const dirs = CLIENT_DIRS.filter((d) => existsSync(d));
const problems = []; let scanned = 0;
if (!dirs.length) problems.push('no build output found — run the production build first');
for (const f of collect(dirs)) {
  if (f.endsWith('.map')) { if (!allowMaps) problems.push(`${f} → source map shipped to the client`); continue; }
  if (!/\.(js|mjs|cjs|html|css|json|txt|webmanifest|rsc)$/.test(f)) continue;
  const text = readFileSync(f, 'utf8'); scanned++;
  for (const s of secrets) if (text.includes(s.value)) problems.push(`${f} → contains the value of ${s.name} (a server-only variable)`);
  for (const [re, label] of PATTERNS) if (re.test(text)) problems.push(`${f} → ${label}`);
  if (!allowMaps && /[#@]\s*sourceMappingURL=(?!data:)/.test(text)) problems.push(`${f} → references a source map`);
}
console.log(`🔎 check-bundle: ${scanned} client files in ${dirs.join(', ') || '(none)'} · ${secrets.length} private env values checked`);
report('check-bundle', 'SEC-2', problems);
