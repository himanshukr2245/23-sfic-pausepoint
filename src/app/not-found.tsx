// app/not-found.tsx — the one 404 every unknown URL gets (check-live compares hidden paths and decoys against it).
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-fg">Page not found</h1>
      <p className="text-fg-muted">The page you were looking for does not exist.</p>
      <Link href="/" className="inline-flex min-h-touch items-center rounded-xl bg-brand px-6 font-semibold text-brand-fg hover:opacity-90">Go home</Link>
    </div>
  );
}
