// The two traps of refreshing a session inside a nonce-CSP middleware, locked down with a fake @supabase/ssr:
// the rebuilt response must keep x-nonce + CSP, and Supabase's no-store headers must reach it (even after a second cookie write).
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

let writes: { cookies: { name: string; value: string; options: object }[]; headers: Record<string, string> }[] = [];
vi.mock('@supabase/ssr', () => ({
  createServerClient: (_url: string, _key: string, opts: { cookies: { setAll: (c: unknown[], h: Record<string, string>) => void } }) => ({
    auth: { getClaims: async () => { for (const w of writes) opts.cookies.setAll(w.cookies, w.headers); return { data: null, error: null }; } },
  }),
}));

const NO_STORE = 'private, no-cache, no-store, must-revalidate, max-age=0';

async function load(configured: boolean) {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', configured ? 'https://demo.supabase.co' : '');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', configured ? 'sb_publishable_demo' : '');
  return (await import('./middleware')).refreshSession;
}

const passThroughFor = (request: NextRequest) => () => {
  const headers = new Headers(request.headers);
  headers.set('x-nonce', 'N0NCE');
  const r = NextResponse.next({ request: { headers } });
  r.headers.set('Content-Security-Policy', "script-src 'nonce-N0NCE'");
  return r;
};

describe('refreshSession', () => {
  beforeEach(() => { writes = []; });

  it('guest mode (no Supabase env): returns the CSP response untouched', async () => {
    const refresh = await load(false);
    const req = new NextRequest('https://app.example/notes');
    const res = await refresh(req, passThroughFor(req));
    expect(res.headers.get('content-security-policy')).toContain('N0NCE');
  });

  it('a refreshed cookie keeps the nonce + CSP and carries the no-store headers — also after a second write', async () => {
    writes = [
      { cookies: [{ name: 'sb-demo-auth-token', value: 'v1', options: { path: '/' } }], headers: { 'Cache-Control': NO_STORE, Expires: '0', Pragma: 'no-cache' } },
      { cookies: [{ name: 'sb-demo-auth-token', value: 'v2', options: { path: '/' } }], headers: {} },   // later writes get no headers
    ];
    const refresh = await load(true);
    const req = new NextRequest('https://app.example/notes', { headers: { cookie: 'sb-demo-auth-token=old' } });
    const res = await refresh(req, passThroughFor(req));
    expect(res.headers.get('content-security-policy')).toContain('N0NCE');
    expect(res.headers.get('x-middleware-request-x-nonce')).toBe('N0NCE');          // the page render still receives the nonce
    expect(res.headers.get('cache-control')).toBe(NO_STORE);
    expect(res.headers.get('pragma')).toBe('no-cache');
    expect(res.cookies.get('sb-demo-auth-token')?.value).toBe('v2');
    expect(req.cookies.get('sb-demo-auth-token')?.value).toBe('v2');                // and sees the refreshed cookie
  });
});
