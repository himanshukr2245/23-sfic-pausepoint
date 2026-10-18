// middleware.ts — the edge gate (STK-1: middleware.ts on OpenNext today; Next 16's proxy.ts is still experimental there).
// Sets a fresh nonce CSP on every HTML request (SEC-6). The root layout reads x-nonce, which keeps every page dynamic.
// With the auth module it also refreshes the Supabase session (modules/auth/supabase/middleware.ts) — keeping the nonce intact.
// Never the security boundary on its own: pages, Server Actions and the database still check everything themselves.
import { NextResponse, type NextRequest } from 'next/server';

/** Nonce in script-src only: a nonce in style-src makes browsers ignore 'unsafe-inline' and silently breaks React style={{…}} attributes. */
function cspFor(nonce: string, https: boolean) {
  const dev = process.env.NODE_ENV === 'development';
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}`.trim(),
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(https ? ['upgrade-insecure-requests'] : []),            // only on real HTTPS: on local http://127.0.0.1 it would break same-origin assets
  ].join('; ');
}

export async function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());                         // Web Crypto + btoa: works on the edge runtime (no Buffer)
  const csp = cspFor(nonce, request.nextUrl.protocol === 'https:');
  /** Every response leaves through here, so the nonce + CSP survive a session-cookie refresh. */
  const passThrough = () => {
    const headers = new Headers(request.headers);
    headers.set('x-nonce', nonce);
    headers.set('content-security-policy', csp);                   // Next reads the nonce from the request CSP and stamps its own scripts
    const response = NextResponse.next({ request: { headers } });
    response.headers.set('Content-Security-Policy', csp);
    return response;
  };
  let response = passThrough();
  for (const step of EDGE_STEPS) response = await step(request, passThrough);
  return response;
}

/** Modules that need the edge gate add a step (auth: Supabase session refresh). Each rebuilds the response through passThrough. */
type EdgeStep = (request: NextRequest, passThrough: () => NextResponse) => Promise<NextResponse>;
const EDGE_STEPS: EdgeStep[] = [
];

export const config = {
  matcher: [{
    source: '/((?!api/|_next/static|_next/image|favicon.ico|icon|apple-icon|og.png|robots.txt|sitemap.xml|sw.js|manifest.webmanifest|.*\\.(?:png|jpe?g|webp|avif|svg|ico|woff2?)$).*)',
    missing: [{ type: 'header', key: 'next-router-prefetch' }, { type: 'header', key: 'purpose', value: 'prefetch' }],
  }],
};
