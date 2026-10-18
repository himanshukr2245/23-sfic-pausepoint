'use client';
// modules/auth/ui/AccountButton.tsx — "Sign in" or "Account" in the header, decided in the browser from the local session.
// Client-side on purpose: the service worker saves pages WITHOUT cookies (a shared phone must never keep one person's page), so a
// server-rendered "Account" link would read "Sign in" whenever a page came from that cache. Nothing shows when accounts are off.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AUTH_CONFIGURED } from '../config';
import { browserClient } from '../supabase/client';

const link = 'inline-flex min-h-touch items-center rounded-lg px-3 text-sm font-medium text-fg-muted hover:bg-surface-2 hover:text-fg';

export function AccountButton() {
  const [who, setWho] = useState<'unknown' | 'guest' | 'signed-in'>('unknown');

  useEffect(() => {
    const pending = browserClient();                               // the library loads after the page is interactive
    if (!pending) return;
    let alive = true;
    let stop = () => {};
    void pending.then((supabase) => {
      if (!alive) return;
      void supabase.auth.getSession().then(({ data }) => { if (alive) setWho(data.session ? 'signed-in' : 'guest'); }, () => { if (alive) setWho('guest'); });
      const { data } = supabase.auth.onAuthStateChange((_event, session) => { if (alive) setWho(session ? 'signed-in' : 'guest'); });
      stop = () => data.subscription.unsubscribe();
    }, () => { if (alive) setWho('guest'); });
    return () => { alive = false; stop(); };
  }, []);

  if (!AUTH_CONFIGURED) return null;
  if (who === 'unknown') return <span aria-hidden="true" className="inline-block min-h-touch w-20" />;   // no layout jump
  return who === 'signed-in'
    ? <Link href="/account" className={link}>Account</Link>
    : <Link href="/login" className={link}>Sign in</Link>;
}
