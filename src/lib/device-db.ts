// lib/device-db.ts — the naming rule for this app's on-device databases: ONE per person, so a shared phone never shows one person's
// notes to another. Core (not in a module) because both the offline module (opens them) and the auth module (wipes one when an
// account is deleted) need the same rule.

/** `<slug>:<user id>` or `<slug>:guest`. Only characters that are safe in every browser's database name. */
export function dbNameFor(slug: string, userId?: string | null): string {
  const who = userId && /^[\w-]{1,64}$/.test(userId) ? userId : 'guest';
  return `${slug}:${who}`;
}
