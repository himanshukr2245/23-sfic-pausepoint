'use client';

// app/about/GreetForm.tsx — Schema-validated interactive form pod with procedural audio (DEV-4).
import { useActionState, useEffect } from 'react';
import { greet, type GreetState } from './actions';
import { playHapticTick, playSuccessChime, unlockAudio } from '@/lib/audio/synthesizer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const initial: GreetState = { ok: false, message: '' };

export function GreetForm() {
  const [state, action, pending] = useActionState(greet, initial);
  const invalid = !state.ok && state.field === 'name';

  useEffect(() => {
    if (state.message) {
      if (state.ok) {
        playSuccessChime();
      } else {
        playHapticTick();
      }
    }
  }, [state]);

  function handleSubmit() {
    unlockAudio();
    playHapticTick();
  }

  return (
    <form
      action={action}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-semibold text-fg flex items-center justify-between">
          <span>Your name:</span>
          <span className="text-xs font-mono font-normal text-fg-muted">Max 60 chars</span>
        </label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          maxLength={60}
          placeholder="e.g. Himanshu or Ada Lovelace"
          aria-invalid={invalid}
          aria-describedby="greet-result"
          className={`min-h-touch rounded-xl border bg-surface/80 px-4 text-sm text-fg shadow-inner transition-all placeholder:text-fg-muted/60 focus:outline-none focus:ring-2 ${
            invalid
              ? 'border-danger focus:ring-danger/30'
              : 'border-border focus:border-brand focus:ring-brand/20'
          }`}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button variant="plain" size="none" latencyMode="none"
          type="submit"
          disabled={pending}
          className="inline-flex min-h-touch items-center justify-center rounded-xl bg-brand px-6 text-sm font-semibold text-brand-fg shadow-md transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {pending ? (
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand-fg border-t-transparent" />
              <span>Checking schema…</span>
            </span>
          ) : (
            'Validate & Say Hello'
          )}
        </Button>
      </div>

      {state.message && (
        <div
          id="greet-result"
          role="status"
          aria-live="polite"
          className={`mt-1 flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
            state.ok
              ? 'border border-success/30 bg-success/10 text-success'
              : 'border border-danger/30 bg-danger/10 text-danger'
          }`}
        >
          <span>{state.ok ? '✓' : '⚠'}</span>
          <span>{state.message}</span>
        </div>
      )}
    </form>
  );
}
