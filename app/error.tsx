'use client';

import { useEffect } from 'react';
import { getRandomEmoji } from '@/lib/data_common';
import Image from 'next/image';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  const selectedEmoji = getRandomEmoji();
  const message = error.message || 'Unknown error';

  return (
    <div className="p-2 lg:p-4 max-w-[1400px] pb-10">
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <h1 className="text-xl lg:text-4xl font-bold text-red-500">500 ERROR:</h1>
        <h1 className="text-xl lg:text-4xl font-bold">{message}</h1>
        <Image
          className="border rounded-md w-96 h-auto"
          src={selectedEmoji}
          alt="Emoji"
          width={384}
          height={384}
        />
        <button
          onClick={reset}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
