// app/auth/confirm/page.tsx — where the links in our emails land (supabase/templates). It shows a button and uses the link only
// when the person taps it: mail scanners open links ahead of people, and a link that confirmed on GET would be burnt before use.
// Never cached by the service worker (/auth is network-only).
import type { Metadata } from 'next';
import Link from 'next/link';
import { OtpType, TokenHash } from '@/modules/auth/forms';
import { safeNext } from '@/modules/auth/next-path';
import { ConfirmEmail } from '@/modules/auth/ui/ConfirmEmail';
import { linkButton } from '@/components/ui/classes';

export const metadata: Metadata = { title: 'Confirm', robots: { index: false, follow: false } };

const TITLE: Record<string, string> = { recovery: 'Reset your password', email_change: 'Confirm your new email' };
const BODY: Record<string, string> = {
  recovery: 'Tap the button to continue. You will then choose a new password.',
  email_change: 'Tap the button to start using your new email address to sign in.',
};

export default async function Confirm({ searchParams }: PageProps<'/auth/confirm'>) {
  const params = await searchParams;
  const tokenHash = TokenHash.safeParse(params.token_hash);
  const type = OtpType.safeParse(params.type);
  const next = safeNext(typeof params.next === 'string' ? params.next : undefined);

  if (!tokenHash.success || !type.success) {
    return (
      <div className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-3xl font-bold text-fg">This link is incomplete</h1>
        <p className="text-fg-muted">Part of the link may be missing — some email apps cut long links. Ask for a new one and open it with one tap.</p>
        <p><Link href="/login" className={linkButton}>Go to sign in</Link></p>
      </div>
    );
  }
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <h1 className="text-3xl font-bold text-fg">{TITLE[type.data] ?? 'Confirm your email'}</h1>
      <p className="text-fg-muted">{BODY[type.data] ?? 'Tap the button to confirm your email address and sign in.'}</p>
      <ConfirmEmail tokenHash={tokenHash.data} type={type.data} next={next} />
    </div>
  );
}
