// app/layout.tsx — the app shell. Reading the request nonce (headers()) does two jobs (SEC-6):
//  1. our one inline script (no-flash theme) carries the nonce the middleware CSP expects, and
//  2. it makes EVERY page render per request — a page prerendered at build time would ship framework scripts without the nonce,
//     and the browser would block them. check-dynamic fails the build if any page is prerendered.
import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import Script from 'next/script';
import './globals.css';
import { SITE } from '@/lib/site';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import { TopLoader } from '@/lib/navigation/TopLoader';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { NetworkBanner } from '@/components/NetworkBanner';
import { ObservabilityListener } from '@/components/ObservabilityListener';
import { WebVitals } from '@/components/WebVitals';
import { CommandPalette } from '@/components/CommandPalette';
// #if offline
import { ServiceWorkerRegistrar } from '@/modules/offline/pwa/ServiceWorkerRegistrar';
// #endif

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: { type: 'website', siteName: SITE.name, title: SITE.name, description: SITE.description, url: '/',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: SITE.name }] },
  twitter: { card: 'summary_large_image', title: SITE.name, description: SITE.description, images: ['/og.png'] },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,                                                 // no maximumScale: people must be able to zoom (DEV-4)
  viewportFit: 'cover',                                            // content can use the notch area; safe-area insets keep it clear (DEV-3)
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafbfc' },  // tokens-ok (meta tags cannot use CSS variables)
    { media: '(prefers-color-scheme: dark)', color: '#1a1d24' },   // tokens-ok
  ],
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* static string we wrote ourselves — never user or AI content (SEC-6) */}
        <Script id="theme-init" nonce={nonce} strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a href="#content" className="sr-only z-50 rounded-lg bg-brand px-4 py-3 text-brand-fg focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <TopLoader color="var(--color-brand)" />
        <NetworkBanner />
        <Header />
        <main id="content" tabIndex={-1} className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-8 outline-none">
          {children}
        </main>
        <Footer />
        <ObservabilityListener />
        <WebVitals />
        <CommandPalette />
        {/* #if offline */}
        <ServiceWorkerRegistrar />
        {/* #endif */}
      </body>
    </html>
  );
}
