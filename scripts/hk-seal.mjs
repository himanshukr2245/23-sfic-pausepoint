#!/usr/bin/env node
// scripts/hk-seal.mjs — [SEC-13] cryptographic proof that a codebase existed in this exact form, signed by you.
//   node scripts/hk-seal.mjs keygen                 → creates your Ed25519 key in ~/.hk-seal (NEVER in the repo) + prints the public key
//   node scripts/hk-seal.mjs stamp [--author "Himanshu Kumar"] [--project name]   → writes PROVENANCE.json (hashes + git commit + canary + signature)
//   node scripts/hk-seal.mjs verify                 → checks the signature + file list, says whose key signed it, lists files changed since the stamp
//   node scripts/hk-seal.mjs canary <dir>           → searches a folder (e.g. a downloaded copy of a cloned site's JS) for your canary
// Zero dependencies (node:crypto Ed25519). Works on Windows, macOS, Linux. HK_SEAL_HOME overrides the key folder.
import { generateKeyPairSync, createPrivateKey, createPublicKey, sign, verify, createHash, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';

const KEY_DIR = process.env.HK_SEAL_HOME || join(homedir(), '.hk-seal');
const PRIV = join(KEY_DIR, 'hk-seal-ed25519.pem');
const SKIP = new Set(['node_modules', '.git', '.next', '.next-dev', '.next-android', '.open-next', 'out', 'dist', 'build', '.wrangler', 'coverage', '.vscode', '.hk']);
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
// NOTE: an array replacer filters keys at EVERY depth, so files[] entries serialize as {} here. That is why verify recomputes
// treeSha256 (a signed top-level field) from files[] — kept as-is so every seal stamped by earlier versions still verifies.
const canonical = (obj) => JSON.stringify(obj, Object.keys(obj).sort());
const treeOf = (files) => sha256(files.map((f) => `${f.path}:${f.sha256}`).join('\n'));
const fingerprint = (pem) => sha256(createPublicKey(pem).export({ type: 'spki', format: 'der' })).slice(0, 16);

function listFiles(root) {
  try {
    const tracked = execFileSync('git', ['-C', root, '-c', 'core.quotepath=false', 'ls-files'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
      .split('\n').map((f) => f.trim().replace(/^"(.*)"$/, '$1')).filter((f) => f && existsSync(join(root, f)));   // deleted-but-tracked files are skipped
    if (tracked.length) return tracked;
  } catch { /* not a git repo */ }
  const out = [];
  const walk = (d) => { for (const n of readdirSync(d)) { if (SKIP.has(n)) continue; const p = join(d, n); if (statSync(p).isDirectory()) walk(p); else out.push(relative(root, p).split(sep).join('/')); } };
  walk(root); return out;
}
const gitHead = (root) => { try { return execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; } };
const localPublicKey = () => (existsSync(PRIV) ? createPublicKey(createPrivateKey(readFileSync(PRIV))).export({ type: 'spki', format: 'pem' }) : null);

export function keygen() {
  if (existsSync(PRIV)) return { created: false, publicKeyPem: localPublicKey() };
  mkdirSync(KEY_DIR, { recursive: true });
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  writeFileSync(PRIV, privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600 });
  return { created: true, publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }) };
}

export function stamp(root, { author = 'Himanshu Kumar', project } = {}) {
  if (!existsSync(PRIV)) throw new Error(`no signing key in ${KEY_DIR} — run: node scripts/hk-seal.mjs keygen`);
  const key = createPrivateKey(readFileSync(PRIV));
  const sealPath = join(root, 'PROVENANCE.json');
  let previous = null;
  try { previous = JSON.parse(readFileSync(sealPath, 'utf8')); } catch { /* first seal */ }
  let pkgName = null;
  try { pkgName = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).name ?? null; } catch { /* no package.json */ }
  const files = listFiles(root).filter((f) => f !== 'PROVENANCE.json').sort().map((path) => ({ path, sha256: sha256(readFileSync(join(root, path))) }));
  const body = { schema: 'hk-seal/v1', author, project: project ?? pkgName ?? 'app', createdAt: new Date().toISOString(), commit: gitHead(root),
    canary: previous?.canary || 'hk' + randomBytes(5).toString('hex'),          // stable across re-stamps, so copies made earlier still match
    treeSha256: treeOf(files), files, publicKey: createPublicKey(key).export({ type: 'spki', format: 'pem' }) };
  const signature = sign(null, Buffer.from(canonical(body)), key).toString('base64');
  writeFileSync(sealPath, JSON.stringify({ ...body, signature }, null, 2) + '\n');
  return { canary: body.canary, files: files.length, treeSha256: body.treeSha256, fingerprint: fingerprint(body.publicKey) };
}

export function verifySeal(root) {
  const { signature, ...body } = JSON.parse(readFileSync(join(root, 'PROVENANCE.json'), 'utf8'));
  let okSig = false;
  try { okSig = verify(null, Buffer.from(canonical(body)), createPublicKey(body.publicKey), Buffer.from(signature, 'base64')); } catch { /* malformed key or signature */ }
  const treeOk = Array.isArray(body.files) && treeOf(body.files) === body.treeSha256;   // an edited files[] entry is caught here
  const mine = localPublicKey();
  const signer = !body.publicKey ? 'none' : !mine ? 'unknown' : fingerprint(mine) === fingerprint(body.publicKey) ? 'you' : 'someone-else';
  const changed = (body.files || []).filter((f) => !existsSync(join(root, f.path)) || sha256(readFileSync(join(root, f.path))) !== f.sha256).map((f) => f.path);
  return { signatureValid: okSig && treeOk, signer, fingerprint: body.publicKey ? fingerprint(body.publicKey) : null, changed, author: body.author, createdAt: body.createdAt, commit: body.commit };
}

export function findCanary(dir, canary) {
  const hits = [];
  const walk = (d) => { for (const n of readdirSync(d)) { if (n === 'node_modules' || n === '.git') continue; const p = join(d, n); if (statSync(p).isDirectory()) walk(p); else if (readFileSync(p).includes(canary)) hits.push(p); } };
  walk(dir); return hits;
}

if (process.argv[1] && process.argv[1].endsWith('hk-seal.mjs')) {
  const [cmd, ...rest] = process.argv.slice(2);
  const opt = (n, d) => (rest.includes(n) ? rest[rest.indexOf(n) + 1] : d);
  const fail = (msg) => { console.error(`❌ hk-seal [SEC-13]: ${msg}`); process.exitCode = 1; };
  if (cmd === 'keygen') { const r = keygen(); console.log(r.created ? `🔑 key created in ${KEY_DIR} (back it up offline)` : '🔑 key already exists'); console.log(`fingerprint ${fingerprint(r.publicKeyPem)}`); console.log(r.publicKeyPem); }
  else if (cmd === 'stamp') {
    try { const r = stamp(process.cwd(), { author: opt('--author', 'Himanshu Kumar'), project: opt('--project') }); console.log(`🪪 hk-seal [SEC-13]: sealed ${r.files} files · tree ${r.treeSha256.slice(0, 16)}… · key ${r.fingerprint} · canary ${r.canary}`); }
    catch (e) { fail(e.message); }
  } else if (cmd === 'verify') {
    if (!existsSync('PROVENANCE.json')) fail('no PROVENANCE.json here — run stamp first');
    else {
      const r = verifySeal(process.cwd());
      console.log(r.signatureValid ? `✅ hk-seal [SEC-13]: signature valid — ${r.author}, ${r.createdAt}, key ${r.fingerprint}` : '❌ hk-seal [SEC-13]: signature INVALID (seal or its file list was edited)');
      if (r.signer === 'someone-else') console.log(`⚠️  signed by key ${r.fingerprint}, which is NOT your key — someone re-sealed this code`);
      if (r.signer === 'unknown') console.log(`ℹ️  no local key to compare — check fingerprint ${r.fingerprint} against the one you published`);
      console.log(r.changed.length ? `changed since seal: ${r.changed.join(', ')}` : 'no files changed since seal');
      const ok = r.signatureValid && r.signer !== 'someone-else';
      process.exitCode = ok ? 0 : 1;
      try { (await import('./lib/walk.mjs')).record('hk-seal verify', 'SEC-13', ok ? [] : ['seal invalid'], r.changed.length ? ['files changed since seal'] : []); } catch { /* copied without lib/ */ }
    }
  } else if (cmd === 'canary') {
    if (!existsSync('PROVENANCE.json') || !rest[0] || !existsSync(rest[0])) fail('usage: run in the sealed project: hk-seal.mjs canary <folder-to-search>');
    else { const seal = JSON.parse(readFileSync('PROVENANCE.json', 'utf8')); const hits = findCanary(rest[0], seal.canary); console.log(hits.length ? `🎯 canary ${seal.canary} found in:\n${hits.join('\n')}` : 'canary not found'); }
  } else console.log('usage: hk-seal.mjs keygen | stamp [--author A --project P] | verify | canary <dir>');
}
