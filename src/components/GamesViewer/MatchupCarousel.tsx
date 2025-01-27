/**
 * This takes a list of matchups and displays them in a carousel.
 */
import { Carousel, CarouselContent } from '@/components/ui/carousel';
import type { GameType, PageEntryType } from '@/lib/definitions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GamesProvider } from './GamesProvider';
import { Title, SwipePopover } from './HeaderComponents';
import { GamesViewer } from './GamesViewer';
import { Paginator } from './Paginator';

const queryClient = new QueryClient();

export function MatchupCarousel({
  initialGames,
  codePrefix,
  userId,
  pages,
}: {
  initialGames: GameType[];
  codePrefix: string;
  userId: string;
  pages: PageEntryType[];
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <GamesProvider
        initialGames={initialGames}
        codePrefix={codePrefix}
        pages={pages}
      >
        <div className='flex items-center justify-between pb-2'>
          <Title />
          <SwipePopover />
        </div>
        <Carousel>
          <CarouselContent>
            <GamesViewer userId={userId} />
          </CarouselContent>
        </Carousel>
        <Paginator />
      </GamesProvider>
    </QueryClientProvider>
  );
}
