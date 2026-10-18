// modules/auth/supabase/middleware.ts — refreshes the Supabase session on every page request, inside src/middleware.ts (edge).
// Two traps handled here:
//  1. Rebuilding the response after a cookie refresh must keep the nonce + CSP request headers — so the caller passes `passThrough`,
//     which builds the response WITH them (rebuilding with NextResponse.next({ request }) silently drops x-nonce).
//  2. When auth cookies are written, @supabase/ssr hands over no-store cache headers (only on the FIRST write): they must reach every
//     rebuilt response, or a shared cache could serve one person's session cookie to another.
import type { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { AUTH_CONFIGURED, SUPABASE_KEY, SUPABASE_URL } from '../config';

export async function refreshSession(request: NextRequest, passThrough: () => NextResponse): Promise<NextResponse> {
  let response = passThrough();
  if (!AUTH_CONFIGURED) return response;                           // guest mode: CSP only
  const cacheHeaders: Record<string, string> = {};
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list, headers) => {
        Object.assign(cacheHeaders, headers);
        list.forEach(({ name, value }) => request.cookies.set(name, value));   // the page rendered next must see the refreshed cookie
        response = passThrough();
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        for (const [key, value] of Object.entries(cacheHeaders)) response.headers.set(key, value);
      },
    },
  });
  try { await supabase.auth.getClaims(); }                         // verifies the JWT and refreshes it when it is about to expire
  catch { /* an Auth outage must not take every page down: pages treat the person as signed out */ }
  return response;
}
