'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DateTime } from 'luxon';
import { Logo } from '@/components/nba/logo';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import type { GameType } from '@/lib/definitions';

interface MatchupRibbonProps {
  games: GameType[];
  currentGameCode: string;
  dateCode: string;
}

export function MatchupRibbon({
  games,
  currentGameCode,
  dateCode,
}: MatchupRibbonProps) {
  const router = useRouter();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Find the index of the current matchup
  const currentIndex = useMemo(() => {
    return games.findIndex(
      (game) => game.matchup.code === `${dateCode}/${currentGameCode}`
    );
  }, [games, dateCode, currentGameCode]);

  // Scroll to current matchup on mount and when it changes
  useEffect(() => {
    if (!api || currentIndex === -1) return;

    // Use a small timeout to ensure carousel is fully initialized
    const timeoutId = setTimeout(() => {
      api.scrollTo(currentIndex, false); // Use smooth scroll
      setCurrent(currentIndex);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [api, currentIndex]);

  // Track which slide is currently in view
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  const handleMatchupClick = (game: GameType) => {
    const [gameDateCode, gameCode] = game.matchup.code.split('/');
    router.push(`/matchup/${gameDateCode}/${gameCode}`);
  };

  const formatTime = (timeUtc: string) => {
    const gameTime = DateTime.fromSQL(timeUtc).toJSDate();
    return DateTime.fromJSDate(gameTime).toLocaleString({
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  if (games.length === 0) {
    return null;
  }

  return (
    <div className='w-full border-b border-border bg-background'>
      <Carousel
        opts={{
          align: 'start',
          dragFree: true,
        }}
        setApi={setApi}
        className='w-full'
      >
        <CarouselContent className='-ml-2 py-3 px-2 sm:px-4'>
          {games.map((game, index) => {
            const { matchup } = game;
            const [gameDateCode, gameCode] = matchup.code.split('/');
            const isActive = gameCode === currentGameCode;

            return (
              <CarouselItem key={matchup.code} className='basis-auto pl-2'>
                <button
                  onClick={() => handleMatchupClick(game)}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-2 rounded-lg',
                    'transition-all shrink-0',
                    'border-2',
                    isActive
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent hover:border-border',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  )}
                >
                  {/* Team Logos */}
                  <div className='flex items-center gap-2'>
                    {/* Away Team Logo */}
                    <Logo
                      tricode={matchup.away_code}
                      className='h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0'
                    />

                    {/* VS separator */}
                    <span
                      className={cn(
                        'text-xs font-semibold',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      @
                    </span>

                    {/* Home Team Logo */}
                    <Logo
                      tricode={matchup.home_code}
                      className='h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0'
                    />
                  </div>

                  {/* Game Time */}
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {formatTime(matchup.time_utc)}
                  </span>
                </button>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
