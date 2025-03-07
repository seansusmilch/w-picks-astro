import type { GameType } from '@/lib/definitions';
import { Matchup } from '@/components/GamesViewer/Matchup';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef, useCallback } from 'react';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

const DAY_ABBREVIATIONS: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

type DayButtonProps = {
  day: string;
  isSelected: boolean;
  isToday: boolean;
  gamesCount: number;
  onClick: () => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
};

function DayButton({
  day,
  isSelected,
  isToday,
  gamesCount,
  onClick,
  buttonRef,
}: DayButtonProps) {
  return (
    <Button
      ref={buttonRef}
      variant={isSelected ? 'default' : 'outline'}
      className={cn(
        'whitespace-nowrap snap-center shrink-0',
        gamesCount === 0 && 'opacity-50',
        isToday && 'ring-2 ring-primary'
      )}
      onClick={onClick}
    >
      {DAY_ABBREVIATIONS[day]}
      {gamesCount > 0 && ` (${gamesCount})`}
    </Button>
  );
}

type DaySelectorProps = {
  selectedDay: string;
  today: string;
  gamesByDay: Record<string, GameType[]>;
  onDaySelect: (day: string) => void;
  buttonRefs: (day: string) => (el: HTMLButtonElement | null) => void;
};

function DaySelector({
  selectedDay,
  today,
  gamesByDay,
  onDaySelect,
  buttonRefs,
}: DaySelectorProps) {
  return (
    <div className='relative'>
      <div className='absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent z-10' />
      <div className='absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent z-10' />
      <div className='flex gap-2 overflow-x-auto py-2 px-4 no-scrollbar snap-x snap-mandatory'>
        {DAYS_OF_WEEK.map((day) => (
          <DayButton
            key={day}
            day={day}
            isSelected={selectedDay === day}
            isToday={today === day}
            gamesCount={gamesByDay[day]?.length ?? 0}
            onClick={() => onDaySelect(day)}
            buttonRef={buttonRefs(day)}
          />
        ))}
      </div>
    </div>
  );
}

type DayGamesProps = {
  day: string;
  isToday: boolean;
  games: GameType[];
};

function DayGames({ day, isToday, games }: DayGamesProps) {
  if (!games?.length) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        No games scheduled for {day}
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
      {games.map((game) => {
        const [pageParam, gameParam] = game.matchup.code.split('/');
        return (
          <a
            href={`/matchups?page=${pageParam}&game=${gameParam}`}
            key={game.matchup.id}
            className='block'
          >
            <Matchup
              matchup={game.matchup}
              scoreboard={game.scoreboard}
              picks={game.picks}
            />
          </a>
        );
      })}
    </div>
  );
}

export function WeekGamesSummary({ games }: { games: GameType[] }) {
  const gamesByDay = games.reduce((acc, game) => {
    const day = new Date(game.matchup.time_utc).toLocaleDateString('en-US', {
      weekday: 'long',
    });
    return { ...acc, [day]: [...(acc[day] || []), game] };
  }, {} as Record<string, GameType[]>);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayIndex = DAYS_OF_WEEK.indexOf(today as any);

  const [api, setApi] = useState<CarouselApi>();
  const [selectedDay, setSelectedDay] = useState(today);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (!api) return;

    buttonRefs.current[today]?.scrollIntoView({
      behavior: 'instant',
      inline: 'center',
      block: 'nearest',
    });

    const handleSelect = () => {
      const day = DAYS_OF_WEEK[api.selectedScrollSnap()];
      setSelectedDay(day);
      buttonRefs.current[day]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    };

    api.on('select', handleSelect);
    return () => {
      api.off('select', handleSelect);
    };
  }, [api, today]);

  const handleDaySelect = (day: string) => {
    if (!api) return;
    const index = DAYS_OF_WEEK.indexOf(day as any);
    setSelectedDay(day);
    buttonRefs.current[day]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
    api.scrollTo(index);
  };

  const getButtonRef = (day: string) => (el: HTMLButtonElement | null) => {
    buttonRefs.current[day] = el;
  };

  return (
    <div className='space-y-4'>
      <div className='sticky top-0 bg-background z-10'>
        <DaySelector
          selectedDay={selectedDay}
          today={today}
          gamesByDay={gamesByDay}
          onDaySelect={handleDaySelect}
          buttonRefs={getButtonRef}
        />
      </div>

      <Carousel className='w-full' setApi={setApi} opts={{ skipSnaps: false }}>
        <CarouselContent>
          {DAYS_OF_WEEK.map((day) => (
            <CarouselItem key={day}>
              <div className='p-1'>
                <h2 className='font-bold text-lg mb-4'>
                  {day}
                  {day === today && (
                    <span className='text-primary'>(Today)</span>
                  )}
                </h2>
                <DayGames
                  day={day}
                  isToday={day === today}
                  games={gamesByDay[day] || []}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
