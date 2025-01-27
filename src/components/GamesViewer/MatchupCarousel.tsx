/**
 * This takes a list of matchups and displays them in a carousel.
 */
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import type { GameType, PageEntryType } from '@/lib/definitions';
import { PickTable } from './PickTable';
import { PickForm } from '@/components/Picks/PickForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Matchup } from './Matchup';
import { GamesProvider, useGames } from './GamesProvider';
import { PaginateControls } from '../Matchup/PaginateControls';

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

function GamesViewer({ userId }: { userId: string }) {
  const { games, isLoading, error } = useGames();

  // if (isLoading) return <div>Loading...</div>;
  // if (error) return <div>Error: {error.message}</div>;a

  return isLoading ? (
    <CarouselItem>
      <GameSkeleton />
    </CarouselItem>
  ) : (
    games.map((game) => (
      <CarouselItem key={game.matchup.id} className='flex flex-col gap-4'>
        <Matchup matchup={game.matchup} scoreboard={game.scoreboard} />
        <PickTable matchup={game.matchup} picks={game.picks} />
        <PickForm
          matchup={game.matchup}
          pick={game.picks.find((pick) => pick.user === userId)}
        />
      </CarouselItem>
    ))
  );
}

function Paginator() {
  const { pages, currentPage, setCurrentPage } = useGames();

  const page = pages.find((p) => p.date_code === parseInt(currentPage));
  const nextPage = pages[pages.indexOf(page) + 1];
  const prevPage = pages[pages.indexOf(page) - 1];

  if (!page || !nextPage || !prevPage) return null;

  const handleNext = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const url = new URL(window.location.href);
    url.searchParams.set('page', nextPage.date_code.toString());
    window.history.pushState({}, '', url);
    setCurrentPage(nextPage.date_code.toString());
  };

  const handlePrev = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const url = new URL(window.location.href);
    url.searchParams.set('page', prevPage.date_code.toString());
    window.history.pushState({}, '', url);
    setCurrentPage(prevPage.date_code.toString());
  };

  return (
    <PaginateControls
      page={page}
      nextPage={nextPage}
      prevPage={prevPage}
      onNext={handleNext}
      onPrev={handlePrev}
    />
  );
}

function GameSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='h-36 w-full bg-muted rounded-lg animate-pulse'></div>
      <div className='h-12 w-full bg-muted rounded-lg animate-pulse'></div>
      <div className='h-80 w-full bg-muted rounded-lg animate-pulse'></div>
    </div>
  );
}
