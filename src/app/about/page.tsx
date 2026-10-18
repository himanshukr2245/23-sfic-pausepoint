import type { Metadata } from 'next';
import { AboutExperience } from './AboutExperience';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: `About & Sovereign Manifesto — ${SITE.name}`,
  description: 'The story, philosophy, creator profile, and state-of-the-art architecture powering the HK Universal Standard.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return <AboutExperience />;
}
