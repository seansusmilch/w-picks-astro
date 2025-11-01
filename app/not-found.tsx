import type { Metadata } from 'next';
import { getRandomEmoji } from '@/lib/data_common';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Not Found',
};

export default function NotFound() {
  const selectedEmoji = getRandomEmoji();

  return (
    <div className="p-2 lg:p-4 max-w-[1400px] pb-10">
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <h1 className="text-xl lg:text-4xl font-bold text-red-500">404</h1>
        <h1 className="text-xl lg:text-4xl font-bold">Page not found</h1>
        <Image
          className="border rounded-md w-96 h-auto"
          src={selectedEmoji}
          alt="Emoji"
          width={384}
          height={384}
        />
      </div>
    </div>
  );
}
