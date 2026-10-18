import type { Metadata } from 'next';
import { SupportCenter } from './SupportCenter';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: `Support & Feedback — ${SITE.name}`,
  description: 'Submit bug reports, request new features, contact the engineering team, and view architectural FAQs.',
  alternates: { canonical: '/support' },
};

export default function SupportPage() {
  return <SupportCenter />;
}
