// app/robots.ts — public pages only. Never list hidden or admin paths here: robots.txt is public and would advertise them (SEC-12).
import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }], sitemap: `${SITE.url}/sitemap.xml` };
}
