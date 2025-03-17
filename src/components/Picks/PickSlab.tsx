import { TeamMap } from '@/components/NBA/teamMap';
import type { UserType } from '@/lib/definitions';
import { FlameIcon } from 'lucide-react';
import { DateTime } from 'luxon';
import { Logo } from '@/components/NBA/Logo';
import { UserAvatar } from '@/components/Profile/UserAvatar';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { actions } from 'astro:actions';
import { useMutation } from '@tanstack/react-query';
import { useStore } from '@nanostores/react';
import { queryClient } from '@/stores/query';

export function PickSlab({
  pick,
  user,
  likeCount,
  isLiked,
}: {
  pick: any;
  user: UserType;
  likeCount: number;
  isLiked: boolean;
}) {
  const [likes, setLikes] = useState(likeCount || 0);
  const [liked, setLiked] = useState(isLiked || false);
  const $queryClient = useStore(queryClient);
  const matchup = pick.expand.matchup;
  const teamCode = pick.win_prediction;
  const teamName = TeamMap[teamCode]?.name_short || teamCode;
  const createdAt = DateTime.fromISO(pick.created)
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

  const likeMutation = useMutation(
    {
      mutationFn: async (context) => {
        console.log('mutationFn', context);

        if (!liked) {
          const { error } = await actions.reactions.removeReaction({
            pickId: pick.id,
          });
          if (error) throw new Error('Failed to delete reaction');
        } else {
          const { error } = await actions.reactions.addReaction({
            pickId: pick.id,
          });
          if (error) throw new Error('Failed to create reaction');
        }
      },
      onMutate: () => {
        console.log('onMutate');
        // Optimistically update the UI
        const previousLikes = likes;
        const previousLiked = liked;

        setLikes(liked ? likes - 1 : likes + 1);
        setLiked(!liked);

        return { previousLikes, previousLiked };
      },
      onError: (error, variables, context) => {
        console.log('onError');
        // Revert the optimistic update on error
        if (context) {
          setLikes(context.previousLikes);
          setLiked(context.previousLiked);
        }
        console.error('Error updating like:', error);
      },
      onSettled: () => {
        // Invalidate and refetch relevant queries if needed
        $queryClient.invalidateQueries({ queryKey: ['picks'] });
      },
    },
    $queryClient
  );

  const handleLike = () => {
    likeMutation.mutate();
  };

  return (
    <div className='border-2 shadow-xl rounded-lg p-2 flex gap-2'>
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
          <span className='text-xs font-semibold'>@{user.username}</span>
          <div className='flex items-center border rounded-lg bg-green-500 text-white'>
            <Logo tricode={teamCode} className='w-6 h-6' />
            <span className='py-1 pr-2 text-xs text-nowrap'>{teamName}</span>
          </div>
        </div>

        <div className='flex'>
          <div className='grow text-sm break-words'>
            <p>{pick.comment}</p>
          </div>
          <div className='pt-2'>
            <Button className='min-h-12' variant='ghost' onClick={handleLike}>
              <div className='flex flex-col items-center gap-2'>
                <FlameIcon
                  className={cn(
                    'h-4 w-4',
                    liked && 'text-red-500 fill-red-500'
                  )}
                />
                <span className='tabular-nums'>{likes}</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
