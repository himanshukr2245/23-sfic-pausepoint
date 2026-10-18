// scripts/rls-proof.mjs — [SEC-4] the two-account test. Proves user B cannot read or write user A's rows.
// Zero dependencies: talks to Supabase Auth + PostgREST over fetch. Run against a DEV/STAGING project only.
// env: SUPABASE_URL, SUPABASE_ANON_KEY (publishable), RLS_A_EMAIL, RLS_A_PASSWORD, RLS_B_EMAIL, RLS_B_PASSWORD
// usage: node scripts/rls-proof.mjs <table> <owner_column>        e.g. node scripts/rls-proof.mjs notes owner_id
import { report } from './lib/walk.mjs';

const [table, ownerCol = 'user_id'] = process.argv.slice(2);
const { SUPABASE_URL: url, SUPABASE_ANON_KEY: anon } = process.env;
if (!table || !url || !anon) { console.error('usage: SUPABASE_URL=… SUPABASE_ANON_KEY=… node scripts/rls-proof.mjs <table> [owner_column]'); process.exit(2); }

async function signIn(email, password) {
  const r = await fetch(`${url}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: anon, 'content-type': 'application/json' }, body: JSON.stringify({ email, password }) });
  const j = await r.json(); if (!r.ok) throw new Error(`sign-in failed for ${email}: ${j.error_description || j.msg || r.status}`);
  return { token: j.access_token, id: j.user.id };
}
const rest = (token, path, init = {}) => fetch(`${url}/rest/v1/${path}`, { ...init, headers: { apikey: anon, authorization: `Bearer ${token}`, 'content-type': 'application/json', prefer: 'return=representation', ...(init.headers || {}) } });

const A = await signIn(process.env.RLS_A_EMAIL, process.env.RLS_A_PASSWORD);
const B = await signIn(process.env.RLS_B_EMAIL, process.env.RLS_B_PASSWORD);
const problems = [];

const aRows = await (await rest(A.token, `${table}?select=*&${ownerCol}=eq.${A.id}&limit=5`)).json();
if (!Array.isArray(aRows) || !aRows.length) problems.push(`user A has no rows in "${table}" — seed one row for A first, or the test proves nothing`);

const asB = await rest(B.token, `${table}?select=*&${ownerCol}=eq.${A.id}`);
const leaked = await asB.json();
if (Array.isArray(leaked) && leaked.length) problems.push(`READ LEAK: user B can read ${leaked.length} of user A's rows in "${table}"`);

if (Array.isArray(aRows) && aRows[0]?.id !== undefined) {
  const upd = await rest(B.token, `${table}?id=eq.${aRows[0].id}`, { method: 'PATCH', body: JSON.stringify({ [ownerCol]: B.id }) });
  const changed = upd.ok ? await upd.json() : [];
  if (Array.isArray(changed) && changed.length) problems.push(`WRITE LEAK: user B could modify user A's row ${aRows[0].id} in "${table}"`);
}
const anonRead = await (await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, { headers: { apikey: anon } })).json();
if (Array.isArray(anonRead) && anonRead.length) problems.push(`ANON LEAK: a logged-out visitor can read "${table}"`);

console.log(`🧪 rls-proof: table "${table}" · A=${A.id.slice(0, 8)} · B=${B.id.slice(0, 8)}`);
report('rls-proof', 'SEC-4', problems);
