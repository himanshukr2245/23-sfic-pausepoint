import type { Metadata } from 'next';
import { SettingsHub } from './SettingsHub';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: `Settings & Performance — ${SITE.name}`,
  description: 'Configure appearance, Turbo zero-blur engine, tactile audio synthesizer haptics, and data sovereignty.',
  alternates: { canonical: '/settings' },
};

export default function SettingsPage() {
  return <SettingsHub />;
}
