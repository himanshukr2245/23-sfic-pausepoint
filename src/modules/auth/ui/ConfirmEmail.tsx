'use client';
// modules/auth/ui/ConfirmEmail.tsx — the email link lands on a page with a button; the link is only USED when the person taps it.
// Mail scanners open links in emails ahead of people — a GET that confirmed by itself would burn the one-time link before the
// person ever saw it. After confirming, a full page load (the new session starts clean).
import { useState } from 'react';
import type { EmailOtpType } from '@supabase/supabase-js';
import { browserClient } from '../supabase/client';
import { reloadTo } from '@/lib/reload-to';
import { authMessage } from '../errors';
import { primary } from '@/components/ui/classes';

const LABEL: Record<string, string> = { recovery: 'Continue to choose a new password', email_change: 'Confirm my new email' };

export function ConfirmEmail({ tokenHash, type, next }: { tokenHash: string; type: EmailOtpType; next: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function confirm() {
    const supabase = await browserClient();
    if (!supabase) { setError('Accounts are not switched on in this copy of the app.'); return; }
    setBusy(true);
    setError('');
    try {
      const { error: err } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      if (err) { setError(authMessage(err, 'This link did not work — it may have expired or been used already. Ask for a new one.')); return; }
      reloadTo(type === 'recovery' ? '/auth/reset' : next);
    } catch (err) {
      setError(authMessage(err as { message?: string }));
    } finally { setBusy(false); }
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <button type="button" className={primary} disabled={busy} onClick={() => void confirm()}>
        {busy ? 'Confirming…' : LABEL[type] ?? 'Confirm my email'}
      </button>
      <p role="alert" className="min-h-6 text-danger">{error}</p>
    </div>
  );
}
