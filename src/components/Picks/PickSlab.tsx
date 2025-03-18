import { TeamMap } from '@/components/NBA/teamMap';
import type { PickType, UserType } from '@/lib/definitions';
import { ExternalLinkIcon, FlameIcon } from 'lucide-react';
import { DateTime } from 'luxon';
import { Logo } from '@/components/NBA/Logo';
import { UserAvatar } from '@/components/Profile/UserAvatar';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { actions } from 'astro:actions';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useStore } from '@nanostores/react';
import { queryClient } from '@/stores/query';
import { PickSlabSkeleton } from './PickSlabSkeleton';

type ReactionData = {
  isLiked: boolean;
  totalItems: number;
};

export function PickSlab({
  pick,
  user,
  matchupUrl,
}: {
  pick: PickType;
  user: UserType;
  matchupUrl?: string;
}) {
  const $queryClient = useStore(queryClient);
  const teamCode = pick.win_prediction;
  const teamName = TeamMap[teamCode]?.name_short || teamCode;
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

  // Fetch reactions count
  const { data: reactionData, isLoading } = useQuery<ReactionData>(
    {
      queryKey: ['reactions', pick.id],
      queryFn: async () => {
        const { data, error } = await actions.reactions.getReactions({
          pickId: pick.id,
        });
        if (error) throw new Error('Failed to get reactions');
        return data;
      },
    },
    $queryClient
  );

  const likeMutation = useMutation(
    {
      mutationFn: async (liking: boolean) => {
        const currentData = $queryClient.getQueryData<ReactionData>([
          'reactions',
          pick.id,
        ]);

        if (liking) {
          const { error } = await actions.reactions.addReaction({
            pickId: pick.id,
          });
          if (error) throw new Error('Failed to create reaction');
          return {
            isLiked: true,
            totalItems: currentData?.totalItems + 1 || 1,
          };
        } else {
          const { error } = await actions.reactions.removeReaction({
            pickId: pick.id,
          });
          if (error) throw new Error('Failed to delete reaction');
          return { isLiked: false, totalItems: currentData.totalItems - 1 };
        }
      },
      onMutate: async () => {
        // Cancel any outgoing refetches
        await $queryClient.cancelQueries({ queryKey: ['reactions', pick.id] });

        // Snapshot the previous value
        const previousData = $queryClient.getQueryData<ReactionData>([
          'reactions',
          pick.id,
        ]);

        // Optimistically update to the new value
        $queryClient.setQueryData<ReactionData>(
          ['reactions', pick.id],
          (old) => {
            if (!old) return { isLiked: true, totalItems: 1 };

            return {
              isLiked: !old.isLiked,
              totalItems: old.isLiked ? old.totalItems - 1 : old.totalItems + 1,
            };
          }
        );

        // Return a context with the previous data
        return { previousData };
      },
      onError: (err, variables, context) => {
        console.error('Error in mutation:', err);
        // If the mutation fails, use the context we returned above
        if (context?.previousData) {
          $queryClient.setQueryData(
            ['reactions', pick.id],
            context.previousData
          );
        }
      },
      onSettled: () => {
        // Always refetch after error or success to ensure data consistency
        $queryClient.invalidateQueries({ queryKey: ['reactions', pick.id] });
      },
    },
    $queryClient
  );

  const handleLike = () => {
    likeMutation.mutate(!reactionData?.isLiked);
  };

  if (isLoading) {
    return <PickSlabSkeleton />;
  }

  return (
    <div className='border-2 border-primary-foreground shadow-lg rounded-lg p-2 flex gap-2'>
      <div className='flex flex-col justify-between'>
        <a href={`/profile/${user.username}`}>
          <UserAvatar className='w-10 h-10' avatar_url={user.avatar_url} />
        </a>
        <span className='text-xs text-gray-400 flex items-center gap-1 tabular-nums'>
          {createdAt}
        </span>
      </div>
      <div className='grow flex flex-col'>
        <div className='flex items-center gap-2 justify-between'>
          <span className='text-sm opacity-50'>@{user.username}</span>
          <div className='flex items-center rounded-lg bg-secondary text-secondary-foreground'>
            <Logo tricode={teamCode} className='w-6 h-6' />
            <span className='py-1 pr-2 text-xs text-nowrap'>{teamName}</span>
          </div>
        </div>

        <div className='flex'>
          <div className='grow text-md break-words'>
            <p>{pick.comment}</p>
            {matchupUrl && (
              <a
                href={matchupUrl}
                className='text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1'
              >
                View matchup <ExternalLinkIcon className='w-4 h-4' />
              </a>
            )}
          </div>
          <div className='pt-2'>
            <Button
              className='min-h-12'
              variant='ghost'
              onClick={handleLike}
              disabled={isLoading || likeMutation.isPending}
            >
              <div className='flex flex-col items-center gap-2'>
                <FlameIcon
                  className={cn(
                    'h-4 w-4',
                    reactionData?.isLiked && 'text-red-500 fill-red-500'
                  )}
                />
                <span className='tabular-nums'>
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
