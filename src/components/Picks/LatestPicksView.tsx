import { useState, useEffect, useRef, useCallback } from 'react';
import { UserAvatar } from '@/components/Profile/UserAvatar';
import { getUrlToMatchup } from '@/lib/data_common';
import { Logo } from '@/components/NBA/Logo';
import { TeamMap } from '@/components/NBA/teamMap';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { CalendarIcon, MessageCircleIcon } from 'lucide-react';
import moment from 'moment';
import type { PickType } from '@/lib/definitions';

// Skeleton component for loading state
function PickCardSkeleton() {
  return (
    <Card className='animate-pulse'>
      <CardHeader className='pb-2 pt-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-muted' />
            <div className='h-4 w-24 bg-muted rounded' />
          </div>
          <div className='h-3 w-20 bg-muted rounded' />
        </div>
      </CardHeader>

      <CardContent className='space-y-3'>
        <div className='flex items-center gap-2'>
          <div className='h-4 w-12 bg-muted rounded' />
          <div className='flex items-center gap-1'>
            <div className='h-5 w-5 bg-muted rounded-full' />
            <div className='h-4 w-20 bg-muted rounded' />
          </div>
          <div className='h-4 w-12 bg-muted rounded' />
        </div>

        <div className='h-16 bg-muted/30 p-2 rounded-md'>
          <div className='flex items-start gap-1'>
            <div className='h-4 w-4 bg-muted rounded mt-0.5' />
            <div className='h-4 w-full bg-muted rounded' />
          </div>
        </div>
      </CardContent>

      <CardFooter className='pt-0'>
        <div className='h-3 w-24 bg-muted rounded' />
      </CardFooter>
    </Card>
  );
}

export function LatestPicksViewSkeleton() {
  return (
    <div className='w-full max-w-2xl mx-auto'>
      <Carousel className='w-full'>
        <CarouselContent>
          {[1, 2, 3].map((index) => (
            <CarouselItem key={index} className='md:basis-full'>
              <PickCardSkeleton />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className='left-0' />
        <CarouselNext className='right-0' />
      </Carousel>
    </div>
  );
}

export function LatestPicksView({
  picks,
  isLoading,
}: {
  picks: PickType[];
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

  // Handle button clicks directly
  const handleButtonClick = useCallback(() => {
    stopAutoScroll();
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
                <PickCard pick={pick} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className='left-0' onClick={handleButtonClick} />
          <CarouselNext className='right-0' onClick={handleButtonClick} />
        </Carousel>
      )}
    </div>
  );
}

function PickCard({ pick }: { pick: any }) {
  const user = pick.expand.user;
  const matchup = pick.expand.matchup;
  const isPredictionHome = pick.win_prediction === matchup.home_code;
  const teamCode = pick.win_prediction;
  const teamName = TeamMap[teamCode]?.name || teamCode;
  const matchupUrl = getUrlToMatchup(matchup.code);
  const createdAt = moment(pick.created).fromNow();

  return (
    <Card className='hover:bg-muted/50 transition-colors'>
      <CardHeader className='pb-2 pt-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <UserAvatar className='w-10 h-10' avatar_url={user.avatar_url} />
            <div className='font-medium'>{user.username}</div>
          </div>
          <div className='text-xs text-muted-foreground flex items-center gap-1'>
            <CalendarIcon className='h-3 w-3' />
            {createdAt}
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-3'>
        <div className='flex items-center gap-2 text-sm'>
          <span>Picked</span>
          <div className='flex items-center gap-1 font-medium'>
            <Logo tricode={teamCode} className='h-5 w-5' />
            {teamName}
          </div>
          <span>to win</span>
        </div>

        {pick.comment && (
          <div className='text-sm bg-muted/30 p-2 rounded-md'>
            <div className='flex items-start gap-1'>
              <MessageCircleIcon className='h-4 w-4 mt-0.5 shrink-0 text-muted-foreground' />
              <p>{pick.comment}</p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className='pt-0'>
        <a href={matchupUrl} className='text-xs text-primary hover:underline'>
          View matchup
        </a>
      </CardFooter>
    </Card>
  );
}
