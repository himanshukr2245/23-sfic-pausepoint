// modules/auth/next-path.ts — where to send someone after sign-in or an email link. Only paths on THIS site: an attacker's link
// like /login?next=//evil.example or /login?next=https://evil.example must never become a redirect to their site (open redirect).
export const DEFAULT_NEXT = '/notes';

export function safeNext(value: unknown, fallback: string = DEFAULT_NEXT): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > 512) return fallback;
  if (!value.startsWith('/') || value.startsWith('//')) return fallback;          // //host leaves the site
  if (/[\u0000-\u001f\u007f\\]/.test(value)) return fallback;                      // control characters; any backslash (/\host leaves too)
  try {
    const base = 'https://next.invalid';
    const url = new URL(value, base);
    if (url.origin !== base) return fallback;
    if (url.pathname.startsWith('/auth/')) return fallback;                          // never loop back into an email-link handler
    return url.pathname + url.search + url.hash;
  } catch { return fallback; }
}
