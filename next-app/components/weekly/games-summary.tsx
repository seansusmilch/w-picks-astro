'use client';

import { WeeklyMatchupCard } from './weekly-matchup-card';
import type { GameType } from '@/lib/definitions';

interface GamesSummaryProps {
  games: GameType[];
  isLoading?: boolean;
}

export function GamesSummary({ games, isLoading = false }: GamesSummaryProps) {
  // Games are already sorted by time in the parent component
  if (isLoading) {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 p-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='h-32 rounded-md bg-muted animate-pulse' />
        ))}
      </div>
    );
  }

  if (games.length === 0) {
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
      {games.map((game) => (
        <WeeklyMatchupCard key={game.matchup.id} game={game} />
      ))}
    </div>
  );
}
