import { CarouselItem } from '@/components/ui/carousel';
import { Matchup } from './Matchup';
import { PickTable } from './PickTable';
import { PickForm } from '@/components/Picks/PickForm';
import { useGames } from './GamesProvider';

export function GamesViewer({ userId }: { userId: string }) {
  const { games, isLoading, error } = useGames();

  return isLoading ? (
    <CarouselItem>
      <GameSkeleton />
    </CarouselItem>
  ) : (
    games.map((game) => (
      <CarouselItem key={game.matchup.id} className='flex flex-col gap-4'>
        <Matchup matchup={game.matchup} scoreboard={game.scoreboard} />
        <PickTable matchup={game.matchup} picks={game.picks} />
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
