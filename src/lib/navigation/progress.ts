// navigation/progress.ts — the brain of the Top Loader. Pure, deterministic, unit-tested.
// The component (TopLoader.tsx) and instrumentation-client.ts only wire browser + Next.js events to these functions.

/** The window event that starts the Top Loader (fired by instrumentation-client.ts, or startTopLoader()). */
export const NAV_START_EVENT = 'hk:nav-start';

/** A navigation from `from` to `to` really changes the page: same origin, different path or query. A #hash jump is not a page change. */
export function isPageChange(to: string, from: string): boolean {
  let a: URL, b: URL;
  try { b = new URL(from); a = new URL(to, b); } catch { return false; }
  if (a.protocol !== 'http:' && a.protocol !== 'https:') return false;               // mailto:, tel:, javascript:
  if (a.origin !== b.origin) return false;                                           // external: the browser shows its own spinner
  return a.pathname !== b.pathname || a.search !== b.search;
}

// ── Legacy click filter (Next < 15.3, no onRouterTransitionStart). Do NOT use it with next/link in the bubble phase:
// <Link> always calls preventDefault() to navigate softly, so `defaultPrevented` is true for every Link click and the bar never starts.
export interface ClickLike { button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean; defaultPrevented: boolean }
export interface AnchorLike { href: string; target: string; hasDownload: boolean }      // href = absolute (a.href)
export interface Here { href: string }                                                // location.href

/** Start the bar only for a same-tab, same-origin, real page change that nobody cancelled. */
export function shouldStart(click: ClickLike, a: AnchorLike, here: Here): boolean {
  if (click.defaultPrevented) return false;                       // a component (modal, tabs) took over the click
  if (click.button !== 0) return false;                           // middle/right click
  if (click.metaKey || click.ctrlKey || click.shiftKey || click.altKey) return false;   // new tab / window / download
  if (a.hasDownload) return false;
  if (a.target && a.target !== '_self') return false;
  return isPageChange(a.href, here.href);
}

export interface ProgressOptions { stepMs: number; cap: number; safetyMs: number; fadeMs: number; minVisibleMs: number }
export const DEFAULTS: ProgressOptions = { stepMs: 100, cap: 90, safetyMs: 10_000, fadeMs: 250, minVisibleMs: 300 };

/** start → value climbs toward the cap with diminishing steps → done() snaps to 100 → hidden after fadeMs.
 *  - minVisibleMs: an instant navigation still shows the bar long enough to SEE that the tap registered (LAW-10).
 *  - safetyMs: finishes the bar if a navigation never completes (prevents the "stuck at 85%" bug). */
export class ProgressMachine {
  private value = 0;
  private startedAt: number | null = null;
  private doneAt: number | null = null;
  private doneRequested = false;
  private lastTick = 0;
  private o: ProgressOptions;
  constructor(o: Partial<ProgressOptions> = {}) { this.o = { ...DEFAULTS, ...o }; }

  start(now: number) { this.value = 15; this.startedAt = now; this.doneAt = null; this.doneRequested = false; this.lastTick = now; }

  /** The new page has rendered. Completes now — or once the bar has been visible for minVisibleMs. */
  done(now: number) {
    if (this.startedAt === null) return;
    if (now - this.startedAt < this.o.minVisibleMs) { this.doneRequested = true; return; }
    this.finish(now);
  }

  private finish(now: number) { this.value = 100; this.startedAt = null; this.doneRequested = false; this.doneAt = now; }

  /** Advance time; returns what to render. */
  tick(now: number): { visible: boolean; value: number } {
    if (this.startedAt !== null) {
      const age = now - this.startedAt;
      if (age >= this.o.safetyMs || (this.doneRequested && age >= this.o.minVisibleMs)) this.finish(now);
      else while (now - this.lastTick >= this.o.stepMs) { this.value += (this.o.cap - this.value) * 0.12; this.lastTick += this.o.stepMs; }
    }
    if (this.doneAt !== null && now - this.doneAt >= this.o.fadeMs) { this.doneAt = null; this.value = 0; }
    const visible = this.startedAt !== null || this.doneAt !== null;
    return { visible, value: Math.round(this.value * 10) / 10 };
  }
}
