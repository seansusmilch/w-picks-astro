'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DateRibbon } from './date-ribbon';
import { GamesSummary } from './games-summary';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { GameType } from '@/lib/definitions';
import {
  getInitialDateRange,
  expandDateRange,
  getTodayCodePrefix,
  isToday,
} from '@/lib/date-utils';
import { useGamesByDateCode, queryKeys } from '@/lib/queries';
import { REFRESH_INTERVALS } from '@/lib/constants';

interface GamesViewProps {
  initialDateCode: string;
  initialGames: GameType[];
}

export function GamesView({ initialDateCode, initialGames }: GamesViewProps) {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<string[]>(getInitialDateRange());
  const [selectedDate, setSelectedDate] = useState<string>(initialDateCode);
  const todayCodePrefix = getTodayCodePrefix();

  // Hydrate initial data into React Query cache
  useEffect(() => {
    queryClient.setQueryData(queryKeys.games(initialDateCode), initialGames);
  }, [queryClient, initialDateCode, initialGames]);

  // Get games for selected date with automatic refresh
  // First get games to determine refresh interval
  const currentGamesData = useGamesByDateCode(selectedDate, {
    enabled: !!selectedDate,
  });
  const currentGames = currentGamesData.data || initialGames;

  // Compute refresh interval based on scoreboard presence
  const refetchInterval = useMemo(() => {
    const hasScoreboard = currentGames.some((game) => game.scoreboard);
    return hasScoreboard
      ? REFRESH_INTERVALS.WITH_SCOREBOARD
      : REFRESH_INTERVALS.WITHOUT_SCOREBOARD;
  }, [currentGames]);

  // Use a second query with automatic refresh for always-on polling
  const { data: refreshedGames } = useGamesByDateCode(selectedDate, {
    enabled: !!selectedDate,
    refetchInterval: refetchInterval,
  });

  const finalGames = refreshedGames || currentGames;
  const isLoading = currentGamesData.isLoading;

  // Prefetch games for dates in the date range
  useEffect(() => {
    dateRange.forEach((dateCode) => {
      // Don't prefetch if we already have data or it's the selected date
      const existingData = queryClient.getQueryData<GameType[]>(
        queryKeys.games(dateCode)
      );
      if (!existingData && dateCode !== selectedDate) {
        queryClient.prefetchQuery({
          queryKey: queryKeys.games(dateCode),
          queryFn: async () => {
            const { getGamesByCodePrefix } = await import(
              '@/app/actions/matchups'
            );
            return await getGamesByCodePrefix(dateCode);
          },
        });
      }
    });
  }, [dateRange, selectedDate, queryClient]);

  // Compute games counts from query cache
  const gamesCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    dateRange.forEach((dateCode) => {
      const games = queryClient.getQueryData<GameType[]>(
        queryKeys.games(dateCode)
      );
      counts[dateCode] = games?.length || 0;
    });
    return counts;
  }, [dateRange, queryClient]);

  // Handle date selection
  const handleDateSelect = (dateCode: string) => {
    setSelectedDate(dateCode);
    // React Query will automatically fetch if not in cache
  };

  // Handle date range expansion
  const handleExpandRange = (direction: 'left' | 'right') => {
    setDateRange((prev) => expandDateRange(prev, direction));
  };

  // Handle "Back to Today" click
  const handleBackToToday = () => {
    setSelectedDate(todayCodePrefix);
    // React Query will automatically fetch if not in cache
  };

  const showBackToToday = !isToday(selectedDate);

  return (
    <div className='relative'>
      {/* Sticky date ribbon */}
      <div className='sticky top-0 z-20 bg-background border-b'>
        <div className='relative'>
          <DateRibbon
            dateRange={dateRange}
            selectedDate={selectedDate}
            gamesCounts={gamesCounts}
            onDateSelect={handleDateSelect}
            onExpandRange={handleExpandRange}
          />

          {/* Floating "Back to Today" button - positioned over date ribbon */}
          {showBackToToday && (
            <Button
              onClick={handleBackToToday}
              size='sm'
              className={cn(
                'absolute top-2 right-2 z-30',
                'h-7 px-2 text-xs font-medium',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90',
                'transition-all shadow-md',
                'rounded-md'
              )}
              aria-label='Back to today'
            >
              Today
            </Button>
          )}
        </div>
      </div>

      {/* Games display */}
      <GamesSummary games={finalGames || []} isLoading={isLoading} />
    </div>
  );
}
