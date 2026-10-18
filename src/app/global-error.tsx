'use client';
// app/global-error.tsx — the last resort when the root layout itself fails. It replaces the whole document, so it renders its own
// <html> and <body>. Next prerenders this file (it cannot read the nonce), so it works without its scripts too: the link reloads the app.
import './globals.css';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh items-center justify-center bg-bg p-6 text-fg">
        <div role="alert" className="flex max-w-md flex-col items-center gap-4 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-fg-muted">Nothing you saved is lost. Reload the app to continue.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={reset} className="inline-flex min-h-touch items-center rounded-xl bg-brand px-6 font-semibold text-brand-fg">Try again</button>
            {/* a plain <a> on purpose: it must work even if the app's JavaScript cannot run */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="inline-flex min-h-touch items-center rounded-xl border border-border px-6 font-semibold">Reload</a>
          </div>
        </div>
      </body>
    </html>
  );
}
