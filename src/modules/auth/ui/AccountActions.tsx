'use client';
// modules/auth/ui/AccountActions.tsx — change password · sign out · delete account. Each one in plain words, with its consequence.
// Sign out and delete end with a full page load, so nothing of this person stays in the tab's memory for the next person.
import { useRef, useState, type FormEvent } from 'react';
import { browserClient } from '../supabase/client';
import { reloadTo } from '@/lib/reload-to';
import { authMessage } from '../errors';
import { check, DeleteForm, PasswordForm } from '../forms';
import { SITE } from '@/lib/site';
import { dbNameFor } from '@/lib/device-db';
import { card, danger, field, primary, quiet } from '@/components/ui/classes';

/** Used on /account and on /auth/reset (after a recovery link). `after` = where to go once it is changed. */
export function NewPasswordForm({ after }: { after?: string }) {
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;                                  // React clears e.currentTarget once the handler awaits
    const parsed = check(PasswordForm, { password: new FormData(form).get('password') ?? '' });
    if (!parsed.ok) { setMessage({ ok: false, text: parsed.message }); input.current?.focus(); return; }
    const supabase = await browserClient();
    if (!supabase) return;
    setBusy(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
      if (error) { setMessage({ ok: false, text: authMessage(error) }); input.current?.focus(); return; }
      if (after) { reloadTo(after); return; }
      setMessage({ ok: true, text: 'Your password was changed.' });
      form.reset();
    } catch (err) { setMessage({ ok: false, text: authMessage(err as { message?: string }) }); }
    finally { setBusy(false); }
  }

  return (
    <form noValidate className="flex max-w-md flex-col gap-3" onSubmit={(e) => void submit(e)}>
      <label htmlFor="new-password" className="font-medium text-fg">New password</label>
      <div className="flex gap-2">
        <input id="new-password" ref={input} name="password" type={show ? 'text' : 'password'} autoComplete="new-password" required maxLength={72}
          aria-invalid={message ? !message.ok : undefined} aria-describedby="new-password-hint new-password-message" className={field} />
        <button type="button" className="min-h-touch shrink-0 rounded-xl border border-border px-3 text-sm font-medium text-fg hover:bg-surface-2"
          aria-pressed={show} aria-controls="new-password" onClick={() => setShow((s) => !s)}>{show ? 'Hide' : 'Show'}</button>
      </div>
      <p id="new-password-hint" className="text-sm text-fg-muted">At least 8 characters.</p>
      <button type="submit" className={primary} disabled={busy}>{busy ? 'Saving…' : 'Save new password'}</button>
      <p id="new-password-message" role={message && !message.ok ? 'alert' : 'status'} className={`min-h-6 ${message?.ok ? 'text-success' : 'text-danger'}`}>{message?.text}</p>
    </form>
  );
}

export function SignOutButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button type="button" className={quiet} disabled={busy} onClick={async () => {
      setBusy(true);
      try { (await browserClient())?.auth.signOut({ scope: 'local' }); } catch { /* the local session is cleared even when the network is down */ }
      reloadTo('/');
    }}>{busy ? 'Signing out…' : 'Sign out'}</button>
  );
}

export function DeleteAccount() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = check(DeleteForm, { confirm: new FormData(e.currentTarget).get('confirm') ?? '' });
    if (!parsed.ok) { setError(parsed.message); input.current?.focus(); return; }
    const supabase = await browserClient();
    if (!supabase) return;
    setBusy(true);
    setError('');
    try {
      const userId = (await supabase.auth.getSession()).data.session?.user.id ?? null;
      const { error: err } = await supabase.rpc('starter_delete_account');
      if (err) { setError('Your account could not be deleted right now. Nothing was removed — please try again.'); return; }
      try { await supabase.auth.signOut({ scope: 'local' }); } catch { /* the account is gone; clearing the local session is best effort */ }
      if (userId && typeof indexedDB !== 'undefined') indexedDB.deleteDatabase(dbNameFor(SITE.slug, userId));   // this device's copy too
      reloadTo('/');
    } catch (err) { setError(authMessage(err as { message?: string })); }
    finally { setBusy(false); }
  }

  return (
    <form noValidate className={`${card} max-w-md`} onSubmit={(e) => void submit(e)}>
      <p className="text-fg">This deletes your account and all your notes — on the server and on this device. It cannot be undone.</p>
      <label htmlFor="confirm-delete" className="font-medium text-fg">Type DELETE to confirm</label>
      <input id="confirm-delete" ref={input} name="confirm" autoComplete="off" required maxLength={20} aria-invalid={!!error}
        aria-describedby="delete-message" className={field} />
      <button type="submit" className={danger} disabled={busy}>{busy ? 'Deleting…' : 'Delete my account and notes'}</button>
      <p id="delete-message" role="alert" className="min-h-6 text-danger">{error}</p>
    </form>
  );
}
