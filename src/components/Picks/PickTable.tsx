import clsx from 'clsx';
import { type MatchupType } from '@/lib/definitions';
import type { RecordModel } from 'pocketbase';
import { getPB } from '@/lib/data_client';
import { expandAvatarUrl } from '@/lib/data_common';
import { UserAvatar } from '@/components/Profile/UserAvatar';
import { cn } from '@/lib/utils';
import {
  useQuery,
  QueryClientProvider,
  QueryClient,
} from '@tanstack/react-query';

const queryClient = new QueryClient();

export function PickTable({
  matchup,
  picks,
}: {
  matchup: MatchupType;
  picks: RecordModel[];
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <LiveTable matchup={matchup} picks={picks} />
    </QueryClientProvider>
  );
}

function LiveTable({
  matchup,
  picks,
}: {
  matchup: MatchupType;
  picks: RecordModel[];
}) {
  const { data } = useQuery({
    queryKey: ['picks', matchup.id],
    queryFn: async () => {
      const pb = getPB();
      const picks = await pb.collection('picks').getFullList({
        filter: pb.filter('matchup = {:id}', { id: matchup.id }),
        expand: 'user',
        fields: '*,expand.user.id,expand.user.avatar,expand.user.username',
      });
      console.log('picks', picks);
      const expandedPicks = expandAvatarUrl(picks);
      return expandedPicks;
    },
    initialData: picks,
    refetchInterval: 3000,
    staleTime: 3000,
  });

  return (
    <div
      className={clsx(
        'flex flex-row justify-between max-w-md',
        'border rounded-xl shadow-md',
        'pb-2'
      )}
    >
      <div className='max-w-lg flex flex-col w-full'>
        <div className='flex flex-row justify-evenly'>
          <p>Away</p>
          <p>Home</p>
        </div>
        <div className='flex flex-row'>
          <div className='w-1/2 flex flex-col border-t border-r'>
            {data
              .filter((p) => p.win_prediction === matchup.away_code)
              .map((pick) => (
                <Pick key={pick.id} pick={pick} />
              ))}
          </div>
          <div className='w-1/2 flex flex-col border-t'>
            {data
              .filter((p) => p.win_prediction === matchup.home_code)
              .map((pick) => (
                <Pick key={pick.id} pick={pick} reverse />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Pick({ pick, reverse }: { pick: RecordModel; reverse?: boolean }) {
  return (
    <div
      className={cn(
        'flex p-1 gap-2 border-b',
        reverse ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <div className=''>
        <a href={`/profile/${pick.expand.user.username}`}>
          <UserAvatar avatar_url={pick.expand.user.avatar_url} />
        </a>
      </div>
      <div className='w-4/5 flex flex-col'>
        <a
          className='hover:underline'
          href={`/profile/${pick.expand.user.username}`}
        >
          <p className='text-xs font-semibold'>@{pick.expand.user.username}</p>
        </a>
        <p className='text-sm break-words'>{pick.comment}</p>
      </div>
    </div>
  );
}
