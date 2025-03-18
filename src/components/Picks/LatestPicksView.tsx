import { useState, useEffect, useRef, useCallback } from 'react';
import { getUrlToMatchup } from '@/lib/data_common';
import { PickSlab } from '@/components/Picks/PickSlab';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import type { PickType, UserType } from '@/lib/definitions';
import { PickSlabSkeleton } from './PickSlabSkeleton';

export function LatestPicksViewSkeleton() {
  return (
    <div className='w-full max-w-2xl mx-auto'>
      <Carousel className='w-full'>
        <CarouselContent>
          {[1, 2, 3].map((index) => (
            <CarouselItem key={index} className='md:basis-full'>
              <PickSlabSkeleton />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

export function LatestPicksView({
  picks,
  users,
  isLoading,
}: {
  picks: PickType[];
  users: UserType[];
  isLoading?: boolean;
}) {
  const [api, setApi] = useState<any>(null);
  const intervalRef = useRef<number | null>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const isAutoScrollingRef = useRef(false);

  const scrollNext = useCallback(() => {
    if (api) {
      isAutoScrollingRef.current = true;
      api.scrollNext();
      // Reset the flag after a short delay to allow the select event to fire
      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 100);
    }
  }, [api]);

  // Function to stop auto-scrolling
  const stopAutoScroll = useCallback(() => {
    setAutoScrollEnabled(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Function to handle manual navigation
  const handleManualNavigation = useCallback(() => {
    // Only stop auto-scrolling if it's not triggered by the auto-scroll itself
    if (!isAutoScrollingRef.current) {
      stopAutoScroll();
    }
  }, [stopAutoScroll]);

  useEffect(() => {
    // Only set up auto-scrolling if there are picks and auto-scroll is enabled
    if (picks.length > 1 && api && autoScrollEnabled) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Set up auto-scrolling every 4 seconds
      intervalRef.current = setInterval(scrollNext, 5000) as unknown as number;

      // Clean up interval on unmount
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [api, picks.length, scrollNext, autoScrollEnabled]);

  useEffect(() => {
    // Set up event listeners for user interaction with the carousel
    if (!api) return;
    api.on('select', handleManualNavigation);

    return () => {
      api.off('select', handleManualNavigation);
    };
  }, [api, handleManualNavigation]);

  // Show skeleton while loading
  if (isLoading) {
    return <LatestPicksViewSkeleton />;
  }

  return (
    <div className='w-full max-w-2xl mx-auto'>
      {picks.length === 0 ? (
        <div className='text-center py-8 text-muted-foreground'>
          No picks available
        </div>
      ) : (
        <Carousel
          setApi={setApi}
          className='w-full'
          opts={{
            align: 'start',
            loop: true,
          }}
        >
          <CarouselContent>
            {picks.map((pick) => (
              <CarouselItem key={pick.id} className='md:basis-full'>
                <PickSlab
                  pick={pick}
                  user={users.find((user) => user.id === pick.user)}
                  matchupUrl={getUrlToMatchup(pick.expand.matchup.code)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </div>
  );
}
