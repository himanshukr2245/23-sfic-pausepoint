// scripts/check-secrets.mjs — [SEC-1] blocks leaked credentials before they reach GitHub.
//   node scripts/check-secrets.mjs            → scans every file git tracks (what a push would publish)
//   node scripts/check-secrets.mjs --staged   → scans the staged versions only (used by the pre-commit hook)
// First line of defence. Keep GitHub push protection + gitleaks on as well.
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { collect, report } from './lib/walk.mjs';

const PATTERNS = [
  [/gsk_[A-Za-z0-9]{20,}/, 'Groq API key'],
  [/AIza[0-9A-Za-z_\-]{35}/, 'Google / Gemini / Firebase API key'],
  [/\bsk-(?:proj-|ant-|svcacct-)?[A-Za-z0-9_\-]{20,}/, 'OpenAI / Anthropic-style secret key'],
  [/\bsb_secret_[A-Za-z0-9_\-]{10,}/, 'Supabase secret key'],
  [/\bgh[pousr]_[A-Za-z0-9]{36,}|\bgithub_pat_[A-Za-z0-9_]{40,}/, 'GitHub token'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key id'],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}/, 'Slack token'],
  [/\b(?:sk|rk)_live_[A-Za-z0-9]{16,}/, 'Stripe live secret key'],
  [/-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY( BLOCK)?-----/, 'Private key block'],
  [/NEXT_PUBLIC_[A-Z0-9_]*(?:SECRET|SERVICE_ROLE|PRIVATE)[A-Z0-9_]*/, 'Secret-looking variable exposed to the browser via NEXT_PUBLIC_'],
  [/(?:postgres(?:ql)?|mongodb(?:\+srv)?|mysql|redis):\/\/[^\s:@/]+:[^\s@/]{6,}@/, 'Database URL with an embedded password'],
];
// JWTs: only a Supabase *service_role* token is secret (anon/publishable tokens are public by design).
const JWT = /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g;
const isServiceRole = (jwt) => { try { return JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString()).role === 'service_role'; } catch { return false; } };

const BINARY = /\.(png|jpe?g|webp|avif|gif|ico|mp3|wav|ogg|mp4|webm|woff2?|ttf|otf|pdf|apk|aab|zip|gz|jar)$/i;
const LOCKFILES = /(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?)$/;
const staged = process.argv.includes('--staged');
const git = (args) => execFileSync('git', ['-c', 'core.quotepath=false', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 256 * 1024 * 1024 });

let files, read;
try {
  files = (staged ? git(['diff', '--cached', '--name-only', '--diff-filter=ACMR']) : git(['ls-files'])).split('\n').filter(Boolean);
  read = staged ? (f) => git(['show', `:${f}`]) : (f) => readFileSync(f, 'utf8');
} catch { files = collect('.'); read = (f) => readFileSync(f, 'utf8'); }

const problems = [], warnings = [];
for (const f of files) {
  if (/(^|[\\/])\.env(\..+)?$/.test(f) && !/\.example$/.test(f)) problems.push(`${f} is tracked by git — git rm --cached it, then ROTATE every key inside`);
  if (/(^|[\\/])\.dev\.vars$/.test(f)) problems.push(`${f} (Wrangler local secrets) is tracked by git — git rm --cached it, then ROTATE every key inside`);
  if (/\.(jks|keystore|p12|pfx|pem)$/i.test(f)) problems.push(`${f} (certificate / signing key file) is tracked by git`);
  if (BINARY.test(f) || LOCKFILES.test(f) || (!staged && !existsSync(f))) continue;
  let text; try { text = read(f); } catch { continue; }
  text.split('\n').forEach((line, i) => {
    if (line.includes('secrets-ok')) return;
    for (const [re, label] of PATTERNS) if (re.test(line)) problems.push(`${f}:${i + 1} → ${label}`);
    for (const m of line.match(JWT) || []) if (isServiceRole(m)) problems.push(`${f}:${i + 1} → Supabase service_role JWT (bypasses all RLS)`);
  });
}
const gi = existsSync('.gitignore') ? readFileSync('.gitignore', 'utf8') : '';
if (!/^\.env/m.test(gi)) problems.push('.gitignore does not ignore .env files — add ".env*" and "!.env.example"');
if (!/^\/?\.dev\.vars/m.test(gi)) warnings.push('.gitignore does not ignore .dev.vars (Wrangler local secrets) — add ".dev.vars"');
report(staged ? 'check-secrets (staged)' : 'check-secrets', 'SEC-1', problems, warnings);
