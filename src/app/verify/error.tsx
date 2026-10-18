'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function VerifyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Verify error boundary caught:', error);
  }, [error]);

  return (
    <div className="w-full max-w-lg mx-auto py-16 px-4 text-center flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-danger/10 text-danger flex items-center justify-center">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-bold text-fg">Unable to load verification brake</h2>
      <p className="text-sm text-fg-muted max-w-sm">
        An error occurred while preparing the verification engine. Your input was not transmitted anywhere.
      </p>
      <Button
        onClick={() => reset()}
        variant="primary"
        size="md"
        className="mt-2 flex items-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Try Again</span>
      </Button>
    </div>
  );
}
