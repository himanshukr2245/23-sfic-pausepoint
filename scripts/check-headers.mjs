// scripts/check-headers.mjs — [SEC-6] checks the security headers a deployed URL actually sends.
//   node scripts/check-headers.mjs https://your-app.example.workers.dev
// Headers set in next.config.ts are ignored by static export, and public/_headers only covers static files — always test the live URL.
// check-live.mjs imports checkHeaders() so both gates apply the same rules.
import { report, isMain } from './lib/walk.mjs';

/** headers: anything with get(name) (a fetch Headers object). Returns { problems, warnings }. */
export function checkHeaders(headers, url) {
  const h = (k) => headers.get(k) || '';
  const problems = [], warnings = [];
  const csp = h('content-security-policy');
  const script = (csp.match(/script-src([^;]*)/) || [, ''])[1];
  if (!csp) problems.push('Content-Security-Policy missing');
  else {
    if (!/frame-ancestors\s+('none'|'self')/.test(csp) && !/^(DENY|SAMEORIGIN)$/i.test(h('x-frame-options'))) problems.push('no clickjacking protection (frame-ancestors or X-Frame-Options)');
    if (/'unsafe-eval'/.test(script || csp)) problems.push("CSP allows 'unsafe-eval' in scripts");
    if (/'unsafe-inline'/.test(script) && !/'nonce-|'sha(256|384|512)-/.test(script)) warnings.push("CSP script-src uses 'unsafe-inline' without nonces/hashes — weak XSS protection (acceptable only for static sites without user-generated HTML)");
    if (!/object-src\s+'none'/.test(csp)) warnings.push("add object-src 'none'");
    if (!/base-uri\s+('none'|'self')/.test(csp)) warnings.push("add base-uri 'self'");
  }
  if (h('x-content-type-options').toLowerCase() !== 'nosniff') problems.push('X-Content-Type-Options: nosniff missing');
  if (!h('referrer-policy')) problems.push('Referrer-Policy missing');
  if (!h('permissions-policy')) warnings.push('Permissions-Policy missing');
  if (url.startsWith('https://') && !/max-age=\d{7,}/.test(h('strict-transport-security'))) problems.push('Strict-Transport-Security missing or max-age < ~4 months');
  if (h('x-powered-by')) warnings.push(`X-Powered-By leaks "${h('x-powered-by')}" — set poweredByHeader: false`);
  if (/\d/.test(h('server'))) warnings.push(`Server header leaks a version: "${h('server')}"`);
  return { problems, warnings };
}

if (isMain(import.meta.url)) {
  const url = process.argv[2];
  if (!url) { console.error('usage: node scripts/check-headers.mjs <url>'); process.exit(2); }
  const res = await fetch(url, { redirect: 'manual' });
  const { problems, warnings } = checkHeaders(res.headers, url);
  console.log(`🌐 check-headers: ${url} → HTTP ${res.status}`);
  report('check-headers', 'SEC-6', problems, warnings);
}
