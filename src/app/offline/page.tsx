// app/offline/page.tsx — what the service worker shows for a page it has not saved, when there is no network (OFF-1).
// Calm and useful: say what happened, what still works, and that nothing is lost.
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Offline', robots: { index: false, follow: false } };

export default function Offline() {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <h1 className="text-3xl font-bold text-fg">You are offline</h1>
      <p className="text-fg-muted">This page has not been saved on this device yet, so it needs the internet. Your notes work without it.</p>
      <p>
        <Link href="/notes" className="inline-flex min-h-touch items-center rounded-xl bg-brand px-5 font-semibold text-brand-fg hover:opacity-90">
          Open your notes
        </Link>
      </p>
    </div>
  );
}
