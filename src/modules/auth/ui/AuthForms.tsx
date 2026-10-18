'use client';
// modules/auth/ui/AuthForms.tsx — sign in · create an account · forgot password, on one screen.
// Auth calls go from the BROWSER to Supabase Auth on purpose: Supabase's per-IP rate limits and CAPTCHA then see the real person's
// address (from a Server Action every attempt would come from Cloudflare's shared IPs). Data stays protected by RLS either way.
// After signing in the page reloads fully: nothing from before sign-in (a guest's store, cached state) stays in memory.
// Enumeration-safe: sign-in never says which field was wrong; reset and sign-up answer the same whether or not the email exists.
import { useRef, useState, type FormEvent } from 'react';
import { browserClient } from '../supabase/client';
import { reloadTo } from '@/lib/reload-to';
import { authMessage } from '../errors';
import { check, ResetForm, SignInForm, SignUpForm } from '../forms';
import { field, linkButton, primary } from '@/components/ui/classes';

export type AuthMode = 'signin' | 'signup' | 'forgot';

const TITLES: Record<AuthMode, string> = { signin: 'Sign in', signup: 'Create an account', forgot: 'Reset your password' };
const SUBMIT: Record<AuthMode, [idle: string, busy: string]> = {
  signin: ['Sign in', 'Signing in…'], signup: ['Create account', 'Creating…'], forgot: ['Send reset link', 'Sending…'],
};

export function AuthForms({ next, initialMode = 'signin' }: { next: string; initialMode?: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const [done, setDone] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);

  const switchTo = (m: AuthMode) => { setMode(m); setError(null); setDone(''); requestAnimationFrame(() => email.current?.focus()); };
  const fail = (message: string, fieldName?: string) => {
    setError({ field: fieldName, message });
    (fieldName === 'password' ? password : email).current?.focus();
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const values = { email: form.get('email') ?? '', password: form.get('password') ?? '' };
    const parsed = check(mode === 'signin' ? SignInForm : mode === 'signup' ? SignUpForm : ResetForm, values);
    if (!parsed.ok) return fail(parsed.message, parsed.field);
    const supabase = await browserClient();
    if (!supabase) return fail('Accounts are not switched on in this copy of the app.');
    const { email: address } = parsed.data as { email: string };
    setBusy(true);
    setError(null);
    setDone('');
    try {
      if (mode === 'signin') {
        const { error: err } = await supabase.auth.signInWithPassword(parsed.data as { email: string; password: string });
        if (err) return fail(authMessage(err), err.code === 'invalid_credentials' ? 'password' : undefined);
        reloadTo(next);                              // a full load on purpose (see the header comment)
        return;
      }
      if (mode === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({ ...(parsed.data as { email: string; password: string }),
          options: { emailRedirectTo: `${window.location.origin}/auth/confirm` } });
        if (err) return fail(authMessage(err), err.code === 'weak_password' ? 'password' : undefined);
        if (data.session) { reloadTo(next); return; } // the project does not ask for email confirmation
        setDone(`Check your inbox: we sent a link to ${address} to confirm your account. It can take a minute — look in spam too.`);
        return;
      }
      const { error: err } = await supabase.auth.resetPasswordForEmail(address, { redirectTo: `${window.location.origin}/auth/reset` });
      if (err && (err.status === 429 || err.status === 0 || err.name === 'AuthRetryableFetchError')) return fail(authMessage(err));
      setDone(`If there is an account for ${address}, we sent it a link to choose a new password.`);
    } catch (err) {
      fail(authMessage(err as { name?: string; message?: string }));
    } finally {
      setBusy(false);
    }
  }

  const invalid = (name: string) => error?.field === name;
  const [idle, working] = SUBMIT[mode];
  return (
    <div className="flex max-w-md flex-col gap-5">
      <h1 className="text-3xl font-bold text-fg">{TITLES[mode]}</h1>
      <form noValidate className="flex flex-col gap-3" onSubmit={(e) => void submit(e)}>
        <label htmlFor="email" className="font-medium text-fg">Email</label>
        <input id="email" ref={email} name="email" type="email" inputMode="email" autoComplete="email" required maxLength={254}
          aria-invalid={invalid('email')} aria-describedby="auth-message" className={field} />
        {mode !== 'forgot' && (
          <>
            <label htmlFor="password" className="font-medium text-fg">Password</label>
            <div className="flex gap-2">
              <input id="password" ref={password} name="password" type={showPassword ? 'text' : 'password'} required maxLength={72}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} aria-invalid={invalid('password')}
                aria-describedby={mode === 'signup' ? 'password-hint auth-message' : 'auth-message'} className={field} />
              <button type="button" className="min-h-touch shrink-0 rounded-xl border border-border px-3 text-sm font-medium text-fg hover:bg-surface-2"
                aria-pressed={showPassword} aria-controls="password" onClick={() => setShowPassword((s) => !s)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {mode === 'signup' && <p id="password-hint" className="text-sm text-fg-muted">At least 8 characters. A short sentence is easy to remember and hard to guess.</p>}
          </>
        )}
        <button type="submit" className={primary} disabled={busy}>{busy ? working : idle}</button>
        <p id="auth-message" role={error ? 'alert' : 'status'} className={`min-h-6 ${error ? 'text-danger' : 'text-success'}`}>{error?.message ?? done}</p>
      </form>
      <div className="flex flex-col items-start">
        {mode === 'signin' && <>
          <button type="button" className={linkButton} onClick={() => switchTo('signup')}>New here? Create an account</button>
          <button type="button" className={linkButton} onClick={() => switchTo('forgot')}>Forgot your password?</button>
        </>}
        {mode !== 'signin' && <button type="button" className={linkButton} onClick={() => switchTo('signin')}>Back to sign in</button>}
      </div>
    </div>
  );
}
