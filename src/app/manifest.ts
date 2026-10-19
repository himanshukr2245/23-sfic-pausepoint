// app/manifest.ts — served as /manifest.webmanifest; makes the app installable (offline module, OFF-3).
// Icons live in public/icons/ (192, 512 and a maskable 512 whose artwork stays inside Android's safe circle).
import type { MetadataRoute } from 'next';
import { SITE } from '../lib/site.ts';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#fafbfc',                                   // tokens-ok (manifest colours cannot use CSS variables)
    theme_color: '#fafbfc',                                        // tokens-ok
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    share_target: {
      action: '/share-target',
      method: 'POST',
      enctype: 'multipart/form-data',
      params: {
        title: 'title',
        text: 'text',
        files: [
          {
            name: 'receipt',
            accept: ['image/*', 'image/png', 'image/jpeg', 'image/webp'],
          },
        ],
      },
    },
  };
}
