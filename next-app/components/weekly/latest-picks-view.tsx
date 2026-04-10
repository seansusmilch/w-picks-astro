'use client';

import { PickSlabSkeleton } from '@/components/ui/pick-skeleton';
import type { PickType } from '@/lib/definitions';
import { TeamMap } from '@/lib/team-map';
import { Logo } from '@/components/nba/logo';
import { UserAvatar } from '@/components/profile/user-avatar';
import { Button } from '@/components/ui/button';
import { useReactions } from '@/lib/queries';
import { useAddReaction, useRemoveReaction } from '@/lib/mutations';
import { DateTime } from 'luxon';
import Link from 'next/link';
import { FlameIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
}

export function LatestPicksViewSkeleton() {
  return (
    <div className="w-full mx-auto space-y-3">
      {[1, 2, 3, 4, 5].map((index) => (
        <PickSlabSkeleton key={index} />
      ))}
    </div>
  );
}

function FeedPickCard({
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
    <article className="relative flex gap-3 px-4 py-3 border-b border-border hover:bg-accent/30 transition-colors">
      {matchupUrl && (
        <Link href={matchupUrl} className="absolute inset-0 z-0" aria-label="View matchup" />
      )}
      <div className="relative z-10 shrink-0">
        <Link href={`/profile/${user.username}`}>
          <UserAvatar
            className="w-10 h-10"
            avatarUrl={user.avatar_url}
            username={user.username}
          />
        </Link>
      </div>
      <div className="grow min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/profile/${user.username}`}
            className="relative z-10 text-sm font-semibold hover:underline"
          >
            @{user.username}
          </Link>
          <span className="text-xs text-muted-foreground tabular-nums">
            {createdAt}
          </span>
        </div>

        {pick.comment && (
          <p className="text-sm leading-relaxed break-words">{pick.comment}</p>
        )}

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full bg-secondary/80 text-secondary-foreground">
              <Logo tricode={teamCode} className="w-5 h-5" />
              <span className="py-0.5 pr-2 text-xs text-nowrap">{teamName}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="relative z-10 gap-1.5 text-muted-foreground hover:text-destructive"
            onClick={handleLike}
            disabled={isLoading || isMutating}
          >
            <FlameIcon
              className={cn(
                'h-4 w-4 transition-transform hover:scale-110',
                reactionData?.isLiked &&
                  'text-destructive fill-destructive scale-110'
              )}
            />
            <span className="text-xs tabular-nums">
              {reactionData?.totalItems || 0}
            </span>
          </Button>
        </div>
      </div>
    </article>
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
  if (isLoading) {
    return <LatestPicksViewSkeleton />;
  }

  if (picks.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">No picks yet</p>
        <p className="text-sm mt-1">Check back later for picks from the community</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto divide-y divide-border">
      {picks.map((pick, index) => (
        <div
          key={pick.id}
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: `${Math.min(index, 5) * 75}ms`, animationFillMode: 'both' }}
        >
          <FeedPickCard
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
        </div>
      ))}
    </div>
  );
}
