'use client';

import { Modal } from '@/app/ui/modal';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <Modal>
      <main className="flex h-full flex-col items-center justify-center p-6">
        <h2 className="text-center">
          Sorry, the service is broken, try again later please
        </h2>
        <button
          className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
          onClick={
            // Attempt to recover by trying to re-render the invoices route
            () => reset()
          }
        >
          Try again
        </button>
      </main>
    </Modal>
  );
}
