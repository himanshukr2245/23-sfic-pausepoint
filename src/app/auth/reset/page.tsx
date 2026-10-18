// app/auth/reset/page.tsx — choose a new password, after a recovery link signed the person in (auth module).
import type { Metadata } from 'next';
import Link from 'next/link';
import { currentUser } from '@/modules/auth/supabase/server';
import { NewPasswordForm } from '@/modules/auth/ui/AccountActions';
import { linkButton } from '@/components/ui/classes';

export const metadata: Metadata = { title: 'New password', robots: { index: false, follow: false } };

export default async function Reset() {
  if (!(await currentUser())) {
    return (
      <div className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-3xl font-bold text-fg">This reset link has expired</h1>
        <p className="text-fg-muted">Reset links work once and only for a short time. Ask for a new one — it takes a minute.</p>
        <p><Link href="/login?mode=forgot" className={linkButton}>Send me a new link</Link></p>
      </div>
    );
  }
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <h1 className="text-3xl font-bold text-fg">Choose a new password</h1>
      <NewPasswordForm after="/notes" />
    </div>
  );
}
