'use client';
// components/ErrorBoundary.tsx — one broken widget must not blank the whole screen (OPS-3). Wrap risky widgets (charts, editors, media).
// Calm fallback, a 48 px "Try again", and one allow-listed telemetry event: code + route, never the error text (it can contain user data).
// For whole routes Next uses app/error.tsx and app/global-error.tsx.
import { Component, type ReactNode } from 'react';
import { ERROR_CODES } from '@/lib/telemetry/events';
import { telemetry } from '@/lib/telemetry/client';

type Props = { children: ReactNode; fallback?: ReactNode; label?: string };
type State = { failed: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State { return { failed: true }; }

  componentDidCatch() {
    telemetry.report({ event: 'client_error', code: ERROR_CODES.CLIENT_JS_EXCEPTION });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return this.props.fallback ?? (
      <div role="alert" className="flex flex-col items-center gap-3 rounded-card border border-border bg-surface p-6 text-center">
        <p className="text-fg">{this.props.label ?? 'This part of the screen could not load.'}</p>
        <button type="button" onClick={() => this.setState({ failed: false })}
          className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface-2 px-5 font-medium text-fg">
          Try again
        </button>
      </div>
    );
  }
}
