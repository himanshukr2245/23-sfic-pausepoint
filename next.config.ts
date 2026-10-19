// next.config.ts — Next.js 16 on Cloudflare Workers via OpenNext (HK Universal Library: STK-2, SEC-6).
// The Content-Security-Policy is NOT set here: src/middleware.ts owns it (a per-request nonce), so the browser sees exactly one policy.
import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

// Page security headers (static files get theirs from public/_headers). No CSP here — see the header comment.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const isCap = process.env.CAP === '1' || process.env.BUILD_TARGET === 'android';

const config: NextConfig = {
  // Next 16 keeps `next dev` output in .next/dev, separate from `next build` — no distDir split needed.
  poweredByHeader: false,
  productionBrowserSourceMaps: false,                              // protects original TypeScript source code from public inspection
  compiler: { removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false },
  // Release id for /api/health and telemetry, inlined at build time. Workers Builds injects WORKERS_CI_COMMIT_SHA (OPS-5).
  env: { NEXT_PUBLIC_RELEASE: (process.env.WORKERS_CI_COMMIT_SHA ?? 'local').slice(0, 12) },
  images: { unoptimized: true },                                   // pre-sized images (PRF-3); no image optimizer on Workers
  pageExtensions: isCap
    ? ['ts', 'tsx']
    : ['web.ts', 'web.tsx', 'ts', 'tsx'],
  ...(isCap
    ? {
        output: 'export',
        trailingSlash: true,
        distDir: 'out',
      }
    : {
        async headers() { return [{ source: '/:path*', headers: securityHeaders }]; },
        async redirects() {
          return [
            { source: '/abt', destination: '/about', permanent: false },
            { source: '/idle', destination: '/studio', permanent: false },
            { source: '/ambient', destination: '/ai', permanent: false },
            { source: '/minimal', destination: '/ai', permanent: false },
            { source: '/ai_chat', destination: '/ai', permanent: false },
            { source: '/ai-chat', destination: '/ai', permanent: false },
            { source: '/showcase/ide', destination: '/studio', permanent: false },
            { source: '/showcase/editorial', destination: '/editorial', permanent: false },
            { source: '/showcase/conversational', destination: '/ai', permanent: false },
          ];
        },
      }),
};

export default config;

if (!isCap) {
  initOpenNextCloudflareForDev();                                  // lets `next dev` use Cloudflare bindings
}

