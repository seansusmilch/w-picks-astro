import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GamesProvider } from './GamesProvider';
import { Title, SwipePopover } from './HeaderComponents';
import { MatchupCarousel } from './MatchupCarousel';
import { Paginator } from './Paginator';
import type { PageEntryType, GameType } from '@/lib/definitions';
import { useEffect } from 'react';

const queryClient = new QueryClient();

export function GamesPage({
  codePrefix,
  userId,
  pages,
  initialData,
}: {
  codePrefix: string;
  userId: string;
  pages: PageEntryType[];
  initialData?: GameType[];
}) {
  useEffect(() => {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    if (!params.get('page')) {
      params.set('page', codePrefix);
      window.history.replaceState(null, '', `?${params.toString()}`);
    }
  }, [codePrefix]);

  return (
    <QueryClientProvider client={queryClient}>
      <GamesProvider
        codePrefix={codePrefix}
        pages={pages}
        userId={userId}
        initialData={initialData}
      >
        <div className='flex items-center justify-between pb-2'>
          <Title />
          <SwipePopover />
        </div>
        <MatchupCarousel />
        <Paginator />
      </GamesProvider>
    </QueryClientProvider>
  );
}
