'use client';

import { WeeklyMatchupCard } from './weekly-matchup-card';
import type { GameType } from '@/lib/definitions';
import { cn } from '@/lib/utils';

interface WeekGamesSummaryProps {
  games: GameType[];
  isLoading?: boolean;
}

export function WeekGamesSummary({
  games,
  isLoading = false,
}: WeekGamesSummaryProps) {
  // Sort games by matchup code (game code portion)
  const sortedGames = [...games].sort((a, b) => {
    const [, gameCodeA] = a.matchup.code.split('/');
    const [, gameCodeB] = b.matchup.code.split('/');
    return gameCodeA.localeCompare(gameCodeB);
  });

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 p-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='h-32 rounded-md bg-muted animate-pulse' />
        ))}
      </div>
    );
  }

  if (sortedGames.length === 0) {
    return (
      <div className='text-center py-12 px-4'>
        <p className='text-muted-foreground text-sm sm:text-base'>
          No games scheduled for this day
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 p-4'>
      {sortedGames.map((game) => (
        <WeeklyMatchupCard key={game.matchup.id} game={game} />
      ))}
    </div>
  );
}
