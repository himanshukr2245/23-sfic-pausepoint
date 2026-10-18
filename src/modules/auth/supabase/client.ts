'use client';
// modules/auth/supabase/client.ts — the browser's Supabase client (one per tab), loaded ON DEMAND. Reads the session from the cookies the
// server set. supabase-js is ~66 KB gzip: imported statically, the header's account button put it on EVERY page — even with accounts off
// (check-chunks caught it). Now it is fetched only when accounts are switched on AND something asks for it; e2e/perf.spec.ts proves it.
// The browser's view of "who is signed in" only chooses things on THIS device; every read and write on the server is checked by RLS.
import type { SupabaseClient } from '@supabase/supabase-js';
import { AUTH_CONFIGURED, SUPABASE_KEY, SUPABASE_URL } from '../config';

let client: Promise<SupabaseClient> | null = null;

/** null in guest mode (Supabase not configured) — otherwise the client, loading the library the first time. `await` it. */
export function browserClient(): Promise<SupabaseClient> | null {
  if (!AUTH_CONFIGURED) return null;
  return (client ??= import('@supabase/ssr').then(({ createBrowserClient }) => createBrowserClient(SUPABASE_URL, SUPABASE_KEY)));
}

/** The signed-in person's id from the local session — no network, so it works offline. null for guests. */
export async function localUserId(): Promise<string | null> {
  const supabase = await browserClient();
  if (!supabase) return null;
  try { return (await supabase.auth.getSession()).data.session?.user.id ?? null; } catch { return null; }
}
