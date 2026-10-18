// scripts/check-rls.mjs — [SEC-4] every Supabase table must have RLS enabled + at least one policy,
// and no policy may be "using (true)" unless the table is explicitly declared public with:
//   -- rls-public: table_a, table_b
// Also flags views without security_invoker, SECURITY DEFINER functions (and ones still executable by PUBLIC), and policies that trust user_metadata.
// Reads hk.config.json paths.migrations (default supabase/migrations); skips cleanly if the folder does not exist.
import { readFileSync, existsSync } from 'node:fs';
import { loadConfig } from './lib/config.mjs';
import { collect, report } from './lib/walk.mjs';

const DIR = loadConfig().paths.migrations;
if (!existsSync(DIR)) { console.log(`⏭️  check-rls [SEC-4]: no ${DIR} — skipped`); process.exit(0); }

const raw = collect(DIR, ['.sql']).sort().map((f) => readFileSync(f, 'utf8')).join('\n;\n').toLowerCase();
const allowPublic = new Set([...raw.matchAll(/--\s*rls-public:\s*([a-z0-9_, \t]+)/g)]
  .flatMap((m) => m[1].split(',').map((s) => s.trim())).filter(Boolean));
const sql = raw.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\$([a-z0-9_]*)\$[\s\S]*?\$\1\$/g, '$$$$');               // function bodies: their inner ";" are not statement ends
const statements = sql.split(';').map((s) => s.trim()).filter(Boolean);

const tables = new Set(), rlsOn = new Set(), policyCount = new Map();
const problems = [], warnings = [];
// optional schema: tables outside `public` are not exposed through the client API, so RLS is not required there
const T = '(?:if\\s+(?:not\\s+)?exists\\s+)?(?:only\\s+)?(?:"?([a-z0-9_]+)"?\\.)?"?([a-z0-9_]+)"?';
const EXPOSED = new Set(['public']);

for (const s of statements) {
  let m;
  if ((m = s.match(new RegExp(`^create\\s+table\\s+${T}`))) && EXPOSED.has(m[1] || 'public')) tables.add(m[2]);
  if ((m = s.match(new RegExp(`^alter\\s+table\\s+${T}\\s+enable\\s+row\\s+level\\s+security`)))) rlsOn.add(m[2]);
  if ((m = s.match(/^create\s+policy\s+(?:"[^"]*"|[a-z0-9_]+)\s+on\s+(?:public\.)?"?([a-z0-9_]+)"?/))) {
    const t = m[1];
    policyCount.set(t, (policyCount.get(t) || 0) + 1);
    if (/(using|with\s+check)\s*\(\s*true\s*\)/.test(s) && !allowPublic.has(t))
      problems.push(`policy on "${t}" uses (true) — anyone with the anon key can reach every row`);
  }
}
// Postgres grants EXECUTE on new functions to PUBLIC; revoking from anon alone leaves them callable through PUBLIC.
const revokedFromPublic = new Set(statements.flatMap((s) => {
  const m = s.match(/^revoke\s+(?:execute|all)\s+on\s+function\s+(?:public\.)?"?([a-z0-9_]+)"?[\s\S]*\sfrom\s+([\s\S]+)$/);
  return m && /\bpublic\b/.test(m[2]) ? [m[1]] : [];
}));
const revokedAll = statements.some((s) => /revoke\s+(?:execute|all)\s[\s\S]*\bfunctions\b[\s\S]*\sfrom\s+[\s\S]*\bpublic\b/.test(s));   // "on all functions in schema" / default privileges
// Things that silently bypass or weaken RLS
for (const s of statements) {
  let m;
  if ((m = s.match(/^create\s+(?:or\s+replace\s+)?view\s+(?:public\.)?"?([a-z0-9_]+)"?/)) && !/security_invoker\s*=\s*(true|on)/.test(s))
    warnings.push(`view "${m[1]}" runs with its owner's rights and bypasses RLS — add WITH (security_invoker = true)`);
  if (/^create\s+(?:or\s+replace\s+)?function/.test(s) && /security\s+definer/.test(s)) {
    const name = (s.match(/function\s+(?:public\.)?"?([a-z0-9_]+)/) || [, '?'])[1];
    warnings.push(`function "${name}" is SECURITY DEFINER (bypasses RLS) — check auth.uid() inside it and SET search_path = ''`);
    if (!revokedFromPublic.has(name) && !revokedAll) warnings.push(`function "${name}" is SECURITY DEFINER and still executable by PUBLIC — add: revoke execute on function public.${name}(…) from public, anon;`);
  }
  if (/^create\s+policy/.test(s) && /user_metadata|raw_user_meta_data/.test(s))
    problems.push('a policy trusts user_metadata — users can edit it themselves; use app_metadata (or a roles table) for authorization');
}
for (const t of tables) {
  if (!rlsOn.has(t)) problems.push(`table "${t}" has no ENABLE ROW LEVEL SECURITY`);
  else if (!policyCount.get(t)) warnings.push(`table "${t}" has RLS but zero policies — it will deny all access (safe, but your app can't read it)`);
}
report('check-rls', 'SEC-4', problems, warnings);
