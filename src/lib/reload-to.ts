// lib/reload-to.ts — a FULL page load, on purpose. Only for the moments when the person behind the screen changes: signing in,
// signing out, deleting an account. Nothing of the previous person (a guest's store, cached state) may stay in the tab's memory.
// For every other navigation use <Link> or router.push — they keep the app alive and show the Top Loader (PRF-2).
export function reloadTo(path: string): void {
  window.location.assign(path);
}
