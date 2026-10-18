'use client';
// app/error.tsx — a route crashed: calm words, the rest of the app keeps working, one big "Try again" (OPS-3). Reports a code, never the text.
import { useEffect } from 'react';
import { ERROR_CODES } from '@/lib/telemetry/events';
import { telemetry } from '@/lib/telemetry/client';
import { Button } from '@/components/ui/Button';

export default function RouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { telemetry.report({ event: 'client_error', code: ERROR_CODES.CLIENT_JS_EXCEPTION }); }, []);
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-fg">This page could not load</h1>
      <p className="text-fg-muted">Nothing you saved is lost. Please try again — if it keeps happening, reload the app.</p>
      <Button variant="plain" size="none" latencyMode="none" type="button" onClick={reset}
        className="inline-flex min-h-touch items-center justify-center rounded-xl bg-brand px-6 font-semibold text-brand-fg hover:opacity-90">
        Try again
      </Button>
    </div>
  );
}
