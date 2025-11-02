'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { getGamesByCodePrefix } from '@/app/actions/matchups';

interface GamesViewProps {
  initialDateCode: string;
  initialGames: GameType[];
}

export function GamesView({
  initialDateCode,
  initialGames,
}: GamesViewProps) {
  const [dateRange, setDateRange] = useState<string[]>(getInitialDateRange());
  const [selectedDate, setSelectedDate] = useState<string>(initialDateCode);
  const [gamesCache, setGamesCache] = useState<Record<string, GameType[]>>({
    [initialDateCode]: initialGames,
  });
  const [loadingDates, setLoadingDates] = useState<Set<string>>(new Set());
  const [gamesCounts, setGamesCounts] = useState<Record<string, number>>({
    [initialDateCode]: initialGames.length,
  });
  const todayCodePrefix = getTodayCodePrefix();

  // Fetch games for a specific date
  const fetchGamesForDate = useCallback(
    async (dateCode: string) => {
      if (gamesCache[dateCode] || loadingDates.has(dateCode)) {
        return;
      }

      setLoadingDates((prev) => new Set(prev).add(dateCode));

      try {
        const games = await getGamesByCodePrefix(dateCode);
        setGamesCache((prev) => ({ ...prev, [dateCode]: games }));
        setGamesCounts((prev) => ({ ...prev, [dateCode]: games.length }));
      } catch (error) {
        console.error(`Failed to fetch games for ${dateCode}:`, error);
        setGamesCache((prev) => ({ ...prev, [dateCode]: [] }));
        setGamesCounts((prev) => ({ ...prev, [dateCode]: 0 }));
      } finally {
        setLoadingDates((prev) => {
          const next = new Set(prev);
          next.delete(dateCode);
          return next;
        });
      }
    },
    [gamesCache, loadingDates]
  );

  // Auto-refetch live games every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refetch dates that have games and might be live
      Object.keys(gamesCache).forEach((dateCode) => {
        const games = gamesCache[dateCode];
        if (games && games.length > 0) {
          // Check if any game might be live (status 1 or 2)
          const hasLiveGames = games.some(
            (game) =>
              game.scoreboard?.status === 1 || game.scoreboard?.status === 2
          );
          if (hasLiveGames) {
            fetchGamesForDate(dateCode);
          }
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [gamesCache, fetchGamesForDate]);

  // Fetch games when date is selected
  useEffect(() => {
    fetchGamesForDate(selectedDate);
  }, [selectedDate, fetchGamesForDate]);

  // Handle date selection
  const handleDateSelect = (dateCode: string) => {
    setSelectedDate(dateCode);
    fetchGamesForDate(dateCode);
  };

  // Handle date range expansion
  const handleExpandRange = (direction: 'left' | 'right') => {
    setDateRange((prev) => expandDateRange(prev, direction));
  };

  // Handle "Back to Today" click
  const handleBackToToday = () => {
    setSelectedDate(todayCodePrefix);
    fetchGamesForDate(todayCodePrefix);
    // Scroll to today in the ribbon (handled by DateRibbon component)
  };

  const currentGames = gamesCache[selectedDate] || [];
  const isLoading = loadingDates.has(selectedDate);
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
      <GamesSummary games={currentGames} isLoading={isLoading} />
    </div>
  );
}
