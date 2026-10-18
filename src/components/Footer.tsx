'use client';

// components/Footer.tsx — the visible credit and the release id (handy when someone reports a bug: "which version?").
import { usePathname } from 'next/navigation';
import { SITE, RELEASE } from '@/lib/site';

export function Footer() {
  const pathname = usePathname();
  if (
    pathname?.startsWith('/ai') ||
    pathname?.startsWith('/minimal') ||
    pathname?.startsWith('/studio') ||
    pathname?.startsWith('/editorial')
  ) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-border bg-surface pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="flex w-full flex-wrap items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 pt-3 text-sm text-fg-muted">
        <p>© {new Date().getFullYear()} {SITE.author}</p>
        <p>Release <code className="font-mono">{RELEASE}</code></p>
      </div>
    </footer>
  );
}
