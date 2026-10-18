// modules/auth/supabase/server.ts — a Supabase client for Server Components, Server Actions and Route Handlers (SEC Appendix A.4).
// A NEW client per request (never shared). It carries the PERSON's session from their cookies — never the secret key — so RLS decides.
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_KEY, SUPABASE_URL } from '../config';

export async function createClient() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try { list.forEach(({ name, value, options }) => store.set(name, value, options)); }
        catch { /* called from a Server Component, which cannot set cookies — the middleware refreshes the session instead */ }
      },
    },
  });
}

/** The verified person behind this request, or null. getClaims() checks the JWT signature (locally with asymmetric signing keys). */
export async function currentUser(): Promise<{ id: string; email: string | null } | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const { data, error } = await (await createClient()).auth.getClaims();
    const claims = data?.claims;
    if (error || !claims || typeof claims.sub !== 'string') return null;
    return { id: claims.sub, email: typeof claims.email === 'string' ? claims.email : null };
  } catch { return null; }                                       // an Auth outage reads as "signed out", never as a crashed page
}
