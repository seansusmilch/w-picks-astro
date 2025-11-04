'use client';

import Link from 'next/link';
import { DateTime } from 'luxon';
import { FlameIcon, ExternalLinkIcon } from 'lucide-react';
import type { PickType, UserType } from '@/lib/definitions';
import { TeamMap } from '@/lib/team-map';
import { Logo } from '@/components/nba/logo';
import { UserAvatar } from '@/components/profile/user-avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useReactions } from '@/lib/queries';
import { useAddReaction, useRemoveReaction } from '@/lib/mutations';

interface PickSlabProps {
  pick: PickType;
  user: UserType;
  matchupUrl?: string;
}

export function PickSlab({ pick, user, matchupUrl }: PickSlabProps) {
  const teamCode = pick.win_prediction;
  const teamName = TeamMap[teamCode as keyof typeof TeamMap]?.name_short || teamCode;
  
  // Format relative time
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

  // Fetch reactions using React Query
  const {
    data: reactionData,
    isLoading,
  } = useReactions(pick.id, {
    enabled: !!pick.id,
  });

  // Mutations for adding/removing reactions
  const addReactionMutation = useAddReaction();
  const removeReactionMutation = useRemoveReaction();

  const handleLike = () => {
    if (!reactionData || isLoading) return;

    const willLike = !reactionData.isLiked;

    if (willLike) {
      addReactionMutation.mutate(pick.id);
    } else {
      removeReactionMutation.mutate(pick.id);
    }
  };

  const isMutating = addReactionMutation.isPending || removeReactionMutation.isPending;

  // Team accent colors for colorful picks (simplified - can be enhanced with user settings later)
  const teamInfo = TeamMap[teamCode as keyof typeof TeamMap];
  const colorfulPicks = true; // TODO: Get from user settings

  return (
    <div
      className={cn(
        'rounded-lg relative bg-background p-[2px]',
        colorfulPicks && 'animate-gradient'
      )}
      style={{
        backgroundImage:
          colorfulPicks && teamInfo?.accent
            ? `conic-gradient(from 0deg at 50% 50%, 
              ${teamInfo.accent.primary} 0deg,
              ${teamInfo.accent.secondary} 180deg,
              ${teamInfo.accent.primary} 360deg)`
            : undefined,
      }}
    >
      <div
        className="rounded-lg bg-background/90 flex gap-2 p-2 w-full"
        style={{
          backgroundImage:
            colorfulPicks && teamInfo?.accent
              ? `linear-gradient(135deg, ${teamInfo.accent.primary}10, ${teamInfo.accent.secondary}10)`
              : undefined,
        }}
      >
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
                      reactionData?.isLiked && 'text-destructive fill-destructive'
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
    </div>
  );
}

