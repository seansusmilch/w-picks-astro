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

// Sort games by start time (earliest first)
const sortGamesByTime = (games: GameType[]): GameType[] => {
  return [...games].sort((a, b) => {
    const timeA = new Date(a.matchup.time_utc).getTime();
    const timeB = new Date(b.matchup.time_utc).getTime();
    return timeA - timeB;
  });
};

export function GamesView({ initialDateCode, initialGames }: GamesViewProps) {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<string[]>(getInitialDateRange());
  const [selectedDate, setSelectedDate] = useState<string>(initialDateCode);
  const todayCodePrefix = getTodayCodePrefix();

  // Hydrate initial data into React Query cache (sorted)
  useEffect(() => {
    const sortedInitialGames = sortGamesByTime(initialGames);
    queryClient.setQueryData(
      queryKeys.games(initialDateCode),
      sortedInitialGames
    );
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

  // Sort final games by start time
  const finalGames = useMemo(() => {
    const games = refreshedGames || currentGames;
    return sortGamesByTime(games);
  }, [refreshedGames, currentGames]);

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
            const games = await getGamesByCodePrefix(dateCode);
            return sortGamesByTime(games);
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

  // Ensure URL reflects the selected date on first load
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const current = url.searchParams.get('date');
    if (current !== selectedDate) {
      url.searchParams.set('date', selectedDate);
      window.history.replaceState({ date: selectedDate }, '', url);
    }
  }, []);

  // Sync selected date with browser back/forward
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPopState = () => {
      const url = new URL(window.location.href);
      const param = url.searchParams.get('date');
      setSelectedDate(param || todayCodePrefix);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [todayCodePrefix]);

  // Handle date selection
  const handleDateSelect = (dateCode: string) => {
    setSelectedDate(dateCode);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('date', dateCode);
      window.history.pushState({ date: dateCode }, '', url);
    }
    // React Query will automatically fetch if not in cache
  };

  // Handle date range expansion
  const handleExpandRange = (direction: 'left' | 'right') => {
    setDateRange((prev) => expandDateRange(prev, direction));
  };

  // Handle "Back to Today" click
  const handleBackToToday = () => {
    setSelectedDate(todayCodePrefix);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('date', todayCodePrefix);
      window.history.pushState({ date: todayCodePrefix }, '', url);
    }
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
