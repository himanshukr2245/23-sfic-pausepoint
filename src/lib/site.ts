// lib/site.ts — the one place for the app's name, URL and description (hk:init rewrites these values).
export const SITE = {
  name: 'HK Starter',
  shortName: 'HK Starter',
  description: 'The pre-wired template for every new app — fast, secure, offline-ready, and proven by tests.',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://starter.hkr.dpdns.org').replace(/\/+$/, ''),
  slug: 'hk-starter',                                              // storage names, cache names (hk:init rewrites)
  author: 'Himanshu Kumar',
} as const;

export const RELEASE = process.env.NEXT_PUBLIC_RELEASE ?? 'local';
