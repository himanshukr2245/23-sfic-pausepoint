import type { Metadata } from 'next';
import Link from 'next/link';
import { NotesApp } from './NotesApp';

// Personal content: kept out of search results (DEV-5) and out of the sitemap.
export const metadata: Metadata = { title: 'Notes', robots: { index: false, follow: false }, alternates: { canonical: '/notes' } };

export default function NotesPage() {
  return (
    <div className="flex w-full max-w-4xl flex-col gap-8 pb-16">
      {/* Precision Capsule Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-fg-muted shadow-sm">
          <Link href="/" className="hover:text-fg">Home</Link>
          <span aria-hidden="true" className="opacity-40">/</span>
          <span aria-current="page" className="text-fg">Notes</span>
        </nav>
      </div>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
          Notes
        </h1>
        <p className="text-base text-fg-muted">
          A quick scratchpad. The line below says exactly where your notes are kept.
        </p>
      </header>

      <NotesApp />
    </div>
  );
}
