'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { PickSlabSkeleton } from '@/components/ui/pick-slab-skeleton';
import type { PickType } from '@/lib/definitions';
import { TeamMap } from '@/lib/team-map';
import { Logo } from '@/components/nba/logo';
import { UserAvatar } from '@/components/profile/user-avatar';
import { Button } from '@/components/ui/button';
import { useReactions } from '@/lib/queries';
import { useAddReaction, useRemoveReaction } from '@/lib/mutations';
import { DateTime } from 'luxon';
import Link from 'next/link';
import { ExternalLinkIcon, FlameIcon } from 'lucide-react';
import type { CarouselApi } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
}

export function LatestPicksViewSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Carousel className="w-full">
        <CarouselContent>
          {[1, 2, 3].map((index) => (
            <CarouselItem key={index} className="md:basis-full">
              <PickSlabSkeleton />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

function PickSlab({
  pick,
  user,
  matchupUrl,
}: {
  pick: PickType;
  user: UserProfile;
  matchupUrl?: string;
}) {
  const teamCode = pick.win_prediction;
  const teamName =
    TeamMap[teamCode as keyof typeof TeamMap]?.name_short || teamCode;

  const createdAt = DateTime.fromISO(pick.created.replace(' ', 'T'))
    .toRelative({
      style: 'narrow',
      unit: ['days', 'hours', 'minutes', 'seconds'],
    })
    ?.replace(' sec.', 's')
    .replace(' min.', 'm')
    .replace(' hr.', 'h')
    .replace(' day.', 'd')
    .replace(' ago', '')
    .trim();

  const { data: reactionData, isLoading } = useReactions(pick.id, {
    enabled: !!pick.id,
  });

  const addReactionMutation = useAddReaction();
  const removeReactionMutation = useRemoveReaction();

  const handleLike = () => {
    if (!reactionData || isLoading) return;
    if (!reactionData.isLiked) {
      addReactionMutation.mutate(pick.id);
    } else {
      removeReactionMutation.mutate(pick.id);
    }
  };

  const isMutating =
    addReactionMutation.isPending || removeReactionMutation.isPending;

  return (
    <div className="border border-border rounded-lg p-2 flex gap-2">
      <div className="flex flex-col justify-between">
        <Link href={`/profile/${user.username}`}>
          <UserAvatar
            className="w-10 h-10"
            avatarUrl={user.avatar_url}
            username={user.username}
          />
        </Link>
        <span className="text-xs text-muted-foreground flex items-center gap-1 tabular-nums">
          {createdAt}
        </span>
      </div>
      <div className="grow flex flex-col">
        <div className="flex items-center gap-2 justify-between">
          <span className="text-sm opacity-50">@{user.username}</span>
          <div className="flex items-center rounded-lg bg-secondary text-secondary-foreground">
            <Logo tricode={teamCode} className="w-6 h-6" />
            <span className="py-1 pr-2 text-xs text-nowrap">{teamName}</span>
          </div>
        </div>

        <div className="flex">
          <div className="grow text-md break-words">
            <p>{pick.comment}</p>
            {matchupUrl && (
              <Link
                href={matchupUrl}
                className="text-xs text-primary hover:underline pt-2 inline-flex items-end gap-1"
              >
                View matchup <ExternalLinkIcon className="w-4 h-4" />
              </Link>
            )}
          </div>
          <div className="pt-2">
            <Button
              className="min-h-12"
              variant="ghost"
              onClick={handleLike}
              disabled={isLoading || isMutating}
            >
              <div className="flex flex-col items-center gap-2">
                <FlameIcon
                  className={cn(
                    'h-4 w-4',
                    reactionData?.isLiked &&
                      'text-destructive fill-destructive'
                  )}
                />
                <span className="tabular-nums">
                  {reactionData?.totalItems || 0}
                </span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LatestPicksView({
  picks,
  users,
  isLoading,
}: {
  picks: PickType[];
  users: UserProfile[];
  isLoading?: boolean;
}) {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const isAutoScrollingRef = useRef(false);

  const scrollNext = useCallback(() => {
    if (api) {
      isAutoScrollingRef.current = true;
      api.scrollNext();
      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 100);
    }
  }, [api]);

  const stopAutoScroll = useCallback(() => {
    setAutoScrollEnabled(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleManualNavigation = useCallback(() => {
    if (!isAutoScrollingRef.current) {
      stopAutoScroll();
    }
  }, [stopAutoScroll]);

  useEffect(() => {
    if (picks.length > 1 && api && autoScrollEnabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(scrollNext, 5000);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [api, picks.length, scrollNext, autoScrollEnabled]);

  useEffect(() => {
    if (!api) return;
    api.on('select', handleManualNavigation);
    return () => {
      api.off('select', handleManualNavigation);
    };
  }, [api, handleManualNavigation]);

  if (isLoading) {
    return <LatestPicksViewSkeleton />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {picks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No picks available
        </div>
      ) : (
        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            align: 'start',
            loop: true,
          }}
        >
          <CarouselContent>
            {picks.map((pick) => (
              <CarouselItem key={pick.id} className="md:basis-full">
                <PickSlab
                  pick={pick}
                  user={
                    users.find((u) => u.id === pick.user) || {
                      id: pick.user,
                      username: 'unknown',
                      avatar_url: null,
                    }
                  }
                  matchupUrl={
                    pick.expand?.matchup?.code
                      ? `/matchup/${pick.expand.matchup.code}`
                      : undefined
                  }
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </div>
  );
}
