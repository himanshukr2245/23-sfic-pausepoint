// app/login/page.tsx — sign in · create an account · forgot password (auth module). Already signed in → straight on to `next`.
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AUTH_CONFIGURED } from '@/modules/auth/config';
import { currentUser } from '@/modules/auth/supabase/server';
import { safeNext } from '@/modules/auth/next-path';
import { AuthForms, type AuthMode } from '@/modules/auth/ui/AuthForms';

export const metadata: Metadata = { title: 'Sign in', robots: { index: false, follow: false } };

const MODES: AuthMode[] = ['signin', 'signup', 'forgot'];

export default async function Login({ searchParams }: PageProps<'/login'>) {
  const params = await searchParams;
  const next = safeNext(typeof params.next === 'string' ? params.next : undefined);
  const mode = MODES.find((m) => m === params.mode) ?? 'signin';

  if (!AUTH_CONFIGURED) {
    return (
      <div className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-3xl font-bold text-fg">Accounts are not switched on</h1>
        <p className="text-fg-muted">This copy of the app has no sign-in yet, so your notes are saved on this device only. Nothing is lost.</p>
      </div>
    );
  }
  if (await currentUser()) redirect(next);
  return <AuthForms next={next} initialMode={mode} />;
}
