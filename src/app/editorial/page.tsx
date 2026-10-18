// tokens-ok-file: editorial quote cards and parchment themes use tailored terracotta and amber literary palette
// app/editorial/page.tsx — Dedicated Standalone Editorial Reading, Writing & QuoteMaker Studio Workspace.
import type { Metadata } from 'next';
import { EditorialWorkspace } from '@/components/editorial/EditorialWorkspace';

export const metadata: Metadata = {
  title: 'Editorial Studio · HK Starter',
  description:
    'A high-performance editorial reading, writing, and quote maker studio workspace with twin focus dock, 65ch optical measure, live hardware VSync telemetry, and multi-theme quote card export engine.',
};

export default function EditorialPage() {
  return <EditorialWorkspace />;
}
