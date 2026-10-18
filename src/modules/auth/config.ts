// modules/auth/config.ts — is Supabase configured? Only PUBLIC values here (the publishable key is made for browsers; RLS protects data).
// Without both values the app runs in guest mode: no sign-in, notes stay on this device — it never crashes (LAW-2: deploy first).
export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
export const AUTH_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_KEY);
