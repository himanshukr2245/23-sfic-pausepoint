// lib/site.ts — the one place for the app's name, URL and description (hk:init rewrites these values).
export const SITE = {
  name: 'PausePoint',
  shortName: 'PausePoint',
  description: 'From panic to a complete 1930 report in under a minute, offline, on-device.',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://pausepoint.hkr.dpdns.org').replace(/\/+$/, ''),
  slug: 'pausepoint',                                              // storage names, cache names (hk:init rewrites)
  author: 'Himanshu Kumar',
} as const;

export const RELEASE = process.env.NEXT_PUBLIC_RELEASE ?? 'local';
