// app/account/page.tsx — the signed-in person's own account: who they are, change password, sign out, delete (auth module).
// Checked on the server: no verified session → the sign-in page, then straight back here.
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentUser } from '@/modules/auth/supabase/server';
import { DeleteAccount, NewPasswordForm, SignOutButton } from '@/modules/auth/ui/AccountActions';

export const metadata: Metadata = { title: 'Account', robots: { index: false, follow: false } };

export default async function Account() {
  const user = await currentUser();
  if (!user) redirect('/login?next=/account');
  return (
    <div className="flex max-w-2xl flex-col gap-10">
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-fg">Your account</h1>
        <p className="text-fg-muted">Signed in as <span className="font-medium text-fg">{user.email ?? 'your account'}</span></p>
        <div><SignOutButton /></div>
      </section>
      <section aria-labelledby="password-heading" className="flex flex-col gap-3">
        <h2 id="password-heading" className="text-xl font-semibold text-fg">Change password</h2>
        <NewPasswordForm />
      </section>
      <section aria-labelledby="delete-heading" className="flex flex-col gap-3">
        <h2 id="delete-heading" className="text-xl font-semibold text-fg">Delete account</h2>
        <DeleteAccount />
      </section>
    </div>
  );
}
