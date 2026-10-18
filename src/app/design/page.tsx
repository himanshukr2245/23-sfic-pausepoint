// app/design/page.tsx — the living design catalogue (core: kept in every app made from this template). Not indexed by search engines.
import type { Metadata } from 'next';
import { DesignCatalogue } from './DesignCatalogue';

export const metadata: Metadata = { title: 'Design system', robots: { index: false, follow: false } };

export default function DesignPage() {
  return (
    <div className="flex max-w-4xl flex-col gap-3">
      <h1 className="text-3xl font-bold text-fg">Design system</h1>
      <p className="max-w-2xl text-fg-muted">Every building block of this app in one place. Build new screens from these — AGENTS.md explains the rules, and the gates enforce them.</p>
      <DesignCatalogue />
    </div>
  );
}
