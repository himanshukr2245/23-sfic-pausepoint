// app/sitemap.ts — public, indexable pages (DEV-5). Signed-in screens stay out.
import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/about'].map((path) => ({ url: `${SITE.url}${path}`, changeFrequency: 'monthly', priority: path === '/' ? 1 : 0.6 }));
}
