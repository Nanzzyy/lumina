'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the dev console / monitoring; kept silent to the user.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-serif text-xs uppercase tracking-[0.3em] text-amber-600">
        Something went wrong
      </p>
      <h1 className="mt-4 font-serif text-3xl text-stone-900">We hit a snag</h1>
      <p className="mt-3 max-w-md text-stone-500">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="mt-8 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-700"
      >
        Try again
      </button>
    </div>
  );
}
