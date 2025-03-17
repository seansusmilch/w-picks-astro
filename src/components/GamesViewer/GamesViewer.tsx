import { CarouselItem } from '@/components/ui/carousel';
import { Matchup } from './Matchup';
import { PickForm } from '@/components/Picks/PickForm';
import { useGames } from './GamesProvider';
import { useStore } from '@nanostores/react';
import { queryClient } from '@/stores/query';
import { PickSlab } from '@/components/Picks/PickSlab';

export function GamesViewer() {
  const { games, isLoading, error, userId } = useGames();
  const $queryClient = useStore(queryClient);

  if (error) {
    return (
      <CarouselItem>
        <div className='flex flex-col items-center justify-center gap-4 p-4'>
          <p className='text-destructive'>
            Error loading games: {error.message}
          </p>
          <button
            onClick={() =>
              $queryClient.invalidateQueries({ queryKey: ['games'] })
            }
            className='text-sm text-muted-foreground hover:text-primary'
          >
            Retry
          </button>
        </div>
      </CarouselItem>
    );
  }

  return isLoading ? (
    <CarouselItem>
      <GameSkeleton />
    </CarouselItem>
  ) : (
    games.map((game) => (
      <CarouselItem key={game.matchup.id} className='flex flex-col gap-4'>
        <Matchup matchup={game.matchup} scoreboard={game.scoreboard} />
        <div className='flex flex-col gap-2'>
          {game.picks.map((pick) => (
            <PickSlab key={pick.id} pick={pick} user={pick.expand.user} />
          ))}
        </div>
        {game.scoreboard?.status >= 2 ? (
          <PicksAreLocked />
        ) : (
          <PickForm
            matchup={game.matchup}
            pick={game.picks.find((pick) => pick.user === userId)}
          />
        )}
      </CarouselItem>
    ))
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

function PicksAreLocked() {
  return (
    <div className='flex flex-col gap-4 py-2'>
      <p className='text-sm text-center text-muted-foreground'>
        Picks are locked for this game
      </p>
    </div>
  );
}
