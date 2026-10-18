import type { Metadata } from 'next';
import { StudioCanvas } from './StudioCanvas';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: `Studio Workspace — ${SITE.name}`,
  description: 'Interactive working stage and canvas engine with zoom controls, tactile tool rack, and JSON data mobility.',
  alternates: { canonical: '/studio' },
};

export default function StudioPage() {
  return <StudioCanvas />;
}
