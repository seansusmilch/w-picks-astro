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
import { useState, useEffect, useRef } from 'react';

// Constants
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

// Types
type DayData = {
  name: string;
  isSelected: boolean;
  isToday: boolean;
  gamesCount: number;
};

type DayTabProps = {
  day: DayData;
  onClick: () => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
};

// Helper Components
const DayTab = ({ day, onClick, buttonRef }: DayTabProps) => (
  <Button
    ref={buttonRef}
    variant={day.isSelected ? 'default' : 'outline'}
    className={cn(
      'whitespace-nowrap snap-center shrink-0',
      day.gamesCount === 0 && 'opacity-50',
      day.isToday && 'ring-2 ring-primary'
    )}
    onClick={onClick}
  >
    {DAY_ABBREVIATIONS[day.name]}
    {day.gamesCount > 0 && ` (${day.gamesCount})`}
  </Button>
);

type DayTabsProps = {
  selectedDay: string;
  today: string;
  gamesByDay: Record<string, GameType[]>;
  onDaySelect: (day: string) => void;
  buttonRefs: (day: string) => (el: HTMLButtonElement | null) => void;
};

const DayTabs = ({
  selectedDay,
  today,
  gamesByDay,
  onDaySelect,
  buttonRefs,
}: DayTabsProps) => (
  <div className='relative'>
    <div className='absolute left-0 top-0 bottom-0 w-4 bg-linear-to-r from-background to-transparent z-10' />
    <div className='absolute right-0 top-0 bottom-0 w-4 bg-linear-to-l from-background to-transparent z-10' />
    <div className='flex gap-2 overflow-x-auto py-2 px-4 no-scrollbar snap-x snap-mandatory'>
      {DAYS_OF_WEEK.map((day) => (
        <DayTab
          key={day}
          day={{
            name: day,
            isSelected: selectedDay === day,
            isToday: today === day,
            gamesCount: gamesByDay[day]?.length ?? 0,
          }}
          onClick={() => onDaySelect(day)}
          buttonRef={buttonRefs(day)}
        />
      ))}
    </div>
  </div>
);

type GamesListProps = {
  games: GameType[];
  day: string;
  isToday: boolean;
};

const GamesList = ({ games, day, isToday }: GamesListProps) => {
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
};

// Main Component
export function WeekGamesSummary({ games }: { games: GameType[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedDay, setSelectedDay] = useState(getTodayName());
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isInitialLoad = useRef(true);

  const gamesByDay = organizeGamesByDay(games);
  const today = getTodayName();

  useEffect(() => {
    if (!api) return;

    // Ensure carousel is positioned correctly on initial load
    if (isInitialLoad.current) {
      // Set initial carousel position to today
      const todayIndex = DAYS_OF_WEEK.indexOf(today as any);
      api.scrollTo(todayIndex, true);
      scrollToDay(today, true);
      isInitialLoad.current = false;
    }

    const handleCarouselSelect = () => {
      const day = DAYS_OF_WEEK[api.selectedScrollSnap()];
      setSelectedDay(day);
      scrollToDay(day, false);
    };

    api.on('select', handleCarouselSelect);
    return () => {
      api.off('select', handleCarouselSelect);
    };
  }, [api, today]);

  const handleDaySelect = (day: string) => {
    if (!api) return;
    const index = DAYS_OF_WEEK.indexOf(day as any);
    setSelectedDay(day);
    scrollToDay(day, false);
    api.scrollTo(index);
  };

  const getButtonRef = (day: string) => (el: HTMLButtonElement | null) => {
    buttonRefs.current[day] = el;
  };

  function scrollToDay(day: string, instant: boolean = false) {
    buttonRefs.current[day]?.scrollIntoView({
      behavior: instant ? 'instant' : 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }

  return (
    <div className='space-y-4'>
      <div className='sticky top-0 bg-background z-10'>
        <DayTabs
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
                    <span className='text-primary'> (Today)</span>
                  )}
                </h2>
                <GamesList
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

// Helper functions
function getTodayName(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' });
}

function organizeGamesByDay(games: GameType[]): Record<string, GameType[]> {
  return games.reduce((acc, game) => {
    const day = new Date(game.matchup.time_utc).toLocaleDateString('en-US', {
      weekday: 'long',
    });
    return { ...acc, [day]: [...(acc[day] || []), game] };
  }, {} as Record<string, GameType[]>);
}
