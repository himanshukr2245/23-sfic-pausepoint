import type { Metadata } from 'next';
import { PayAgainBrake } from '@/components/verify/PayAgainBrake.tsx';

export const metadata: Metadata = {
  title: 'Before You Pay Again: Repeat Deposit Brake · PausePoint',
  description:
    'Instant cognitive brake against task and investment scam withdrawal fees and fake bail demands.',
};

export default function VerifyPage() {
  return (
    <main className="min-h-screen bg-bg text-fg">
      <PayAgainBrake />
    </main>
  );
}
