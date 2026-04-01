'use client';

import { useEffect, useRef, useState } from 'react';
import { DateTime } from 'luxon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { isToday, expandDateRange, getTodayCodePrefix } from '@/lib/date-utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRibbonProps {
  dateRange: string[];
  selectedDate: string;
  gamesCounts: Record<string, number>;
  onDateSelect: (dateCode: string) => void;
  onExpandRange: (direction: 'left' | 'right') => void;
}

const DAY_ABBREVIATIONS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function DateRibbon({
  dateRange,
  selectedDate,
  gamesCounts,
  onDateSelect,
  onExpandRange,
}: DateRibbonProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedDateRef = useRef<HTMLButtonElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);
  const todayCodePrefix = getTodayCodePrefix();

  // Scroll selected date into view on mount/change
  useEffect(() => {
    if (selectedDateRef.current && scrollContainerRef.current) {
      selectedDateRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [selectedDate]);

  // Check scroll position to show/hide expand buttons
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScrollPosition = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const threshold = 50;
      const maxScrollLeft = scrollWidth - clientWidth;
      
      // Left button: show when scrolled near the left edge (within threshold)
      setShowLeftButton(scrollLeft <= threshold);
      
      // Right button: show when scrolled near the right edge (within threshold)
      setShowRightButton(scrollLeft >= maxScrollLeft - threshold);
    };

    checkScrollPosition();
    container.addEventListener('scroll', checkScrollPosition);
    // Also check on resize in case container size changes
    window.addEventListener('resize', checkScrollPosition);
    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [dateRange]);

  const formatDate = (dateCode: string) => {
    const dt = DateTime.fromFormat(dateCode, 'yyyyMMdd', {
      zone: 'America/New_York',
    });
    // Luxon weekday: 1=Monday, 7=Sunday
    // DAY_ABBREVIATIONS: 0=Sun, 1=Mon, ..., 6=Sat
    const dayIndex = dt.weekday === 7 ? 0 : dt.weekday;
    return {
      dayAbbr: DAY_ABBREVIATIONS[dayIndex],
      monthAbbr: dt.toFormat('LLL'), // e.g., "Nov"
      dayNum: dt.day,
    };
  };

  return (
    <div className="relative">
      {/* Left expand button */}
      {showLeftButton && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md"
          onClick={() => onExpandRange('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Date ribbon */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto scroll-smooth px-0 sm:px-4 py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {dateRange.map((dateCode) => {
          const { dayAbbr, monthAbbr, dayNum } = formatDate(dateCode);
          const selected = selectedDate === dateCode;
          const isTodayDate = isToday(dateCode);

          return (
            <button
              key={dateCode}
              ref={selected ? selectedDateRef : null}
              onClick={() => onDateSelect(dateCode)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5',
                'min-w-[60px] px-3 py-2 rounded-lg',
                'transition-all shrink-0',
                'border-2',
                selected
                  ? 'border-primary bg-primary/10'
                  : 'border-transparent hover:border-border',
                isTodayDate && !selected && 'ring-2 ring-primary/30'
              )}
            >
              <span
                className={cn(
                  'text-xs font-medium',
                  selected ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {monthAbbr} {dayNum}
              </span>
              <span
                className={cn(
                  'text-sm font-semibold',
                  selected ? 'text-primary' : 'text-foreground'
                )}
              >
                {dayAbbr}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right expand button */}
      {showRightButton && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md"
          onClick={() => onExpandRange('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

    </div>
  );
}

