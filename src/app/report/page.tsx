import type { Metadata } from 'next';
import { ReportFlow } from '@/components/report/ReportFlow';

export const metadata: Metadata = {
  title: 'The Golden Hour: 1930 Cyber Fraud Report · PausePoint',
  description:
    'From panic to a complete 1930 helpline report in under a minute, completely on-device, fully offline.',
};

export default function ReportPage() {
  return <ReportFlow />;
}
