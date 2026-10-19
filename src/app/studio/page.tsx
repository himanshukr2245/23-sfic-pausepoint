import type { Metadata } from 'next';
import { ForensicStudio } from './ForensicStudio';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: `Forensic Investigation Studio — ${SITE.name}`,
  description:
    'Dedicated sovereign scam investigation stage: psychological decompilation, link forensics, UPI financial lien telemetry, and 1-click 1930 police reporting.',
  alternates: { canonical: '/studio' },
};

export default function StudioPage() {
  return <ForensicStudio />;
}
