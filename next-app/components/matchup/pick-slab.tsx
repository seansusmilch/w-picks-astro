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

  const {
    data: reactionData,
    isLoading,
  } = useReactions(pick.id, {
    enabled: !!pick.id,
  });

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

  return (
    <article className="flex gap-3 px-4 py-3 border-b border-border hover:bg-accent/30 transition-colors">
      <div className="shrink-0">
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
            className="text-sm font-semibold hover:underline"
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
            {matchupUrl && (
              <Link
                href={matchupUrl}
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                View matchup <ExternalLinkIcon className="w-3 h-3" />
              </Link>
            )}
            <Link
              href={matchupUrl || '#'}
              className="flex items-center rounded-full bg-secondary/80 text-secondary-foreground hover:bg-secondary transition-colors"
            >
              <Logo tricode={teamCode} className="w-5 h-5" />
              <span className="py-0.5 pr-2 text-xs text-nowrap">{teamName}</span>
            </Link>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-destructive"
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
