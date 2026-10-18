// app/ai/page.tsx — Dedicated Standalone AI Chat Workspace Route.
import type { Metadata } from 'next';
import { MinimalWorkspace } from '@/components/minimal/MinimalWorkspace';

export const metadata: Metadata = {
  title: 'AI Chat · HK Starter',
  description:
    'A high-performance conversational AI workspace with twin focus deck, multi-model cognitive streaming, real-time hardware VSync telemetry, and instant thought scratchpad.',
};

export default function AiPage() {
  return <MinimalWorkspace />;
}
