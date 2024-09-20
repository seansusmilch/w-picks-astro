import clsx from 'clsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type PickType, PickZ, type MatchupType } from '@/lib/definitions';
import { z } from 'astro/zod';
import type { ListResult, RecordModel } from 'pocketbase';
import { useState, useEffect } from 'react';
import { getPB } from '@/lib/data_client';
import { getUserAvatarUrl } from '@/lib/data_common';
import { UserAvatar } from '@/components/Profile/UserAvatar';

export function PickTable({
  matchup,
  picks,
}: {
  matchup: MatchupType;
  picks: RecordModel[];
}) {
  const [livePicks, setLivePicks] = useState(picks);
  useEffect(() => {
    console.log('Adding picks subscription');
    const pb = getPB();
    pb.collection('picks').subscribe(
      '*',
      (data) => {
        console.log('Pick updated!', data.action, data.record);
        if (data.action === 'delete') {
          // remove the pick from the list
          setLivePicks((prev) =>
            prev.filter((pick) => pick.id !== data.record.id)
          );
          return;
        }

        const pick = data.record;
        pick.expand.user.avatar_url = getUserAvatarUrl(
          pick.expand.user.id,
          pick.expand.user.avatar
        );
        if (data.action === 'create') {
          // add the pick to the list with avatar and username
          setLivePicks((prev) => [...prev, pick]);
        } else if (data.action === 'update') {
          // update the pick in the list without changing order
          setLivePicks((prev) =>
            prev.map((p) => (p.id === pick.id ? pick : p))
          );
        }
      },
      {
        filter: pb.filter('matchup = {:id}', { id: matchup.id }),
        expand: 'user',
        fields: '*,expand.user.id,expand.user.avatar,expand.user.username',
      }
    );
  }, []);

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
          <div className='w-1/2 flex flex-col'>
            {livePicks
              .filter((p) => p.win_prediction === matchup.away_code)
              .map((pick) => (
                <AwayPick key={pick.id} pick={pick} />
              ))}
          </div>
          <div className='w-1/2 flex flex-col'>
            {livePicks
              .filter((p) => p.win_prediction === matchup.home_code)
              .map((pick) => (
                <HomePick key={pick.id} pick={pick} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AwayPick({ pick }: { pick: RecordModel }) {
  return (
    <div className='flex flex-row p-1 gap-2 border border-l-0'>
      <UserAvatar avatar_url={pick.expand.user.avatar_url} className='w-1/5' />
      <div className='w-4/5 flex flex-col'>
        <a
          className='hover:underline'
          href={`/profile/${pick.expand.user.username}`}
        >
          <p className='text-xs font-semibold'>@{pick.expand.user.username}</p>
        </a>
        <p className='text-sm break-words pr-2'>{pick.comment}</p>
      </div>
    </div>
  );
}

function HomePick({ pick }: { pick: RecordModel }) {
  return (
    <div className='flex flex-row border border-r-0 p-1'>
      <div className='w-4/5 flex flex-col'>
        <a
          className='hover:underline'
          href={`/profile/${pick.expand.user.username}`}
        >
          <p className='text-xs font-semibold'>@{pick.expand.user.username}</p>
        </a>
        <p className='text-sm break-words'>{pick.comment}</p>
      </div>
      <UserAvatar avatar_url={pick.expand.user.avatar_url} className='w-1/5' />
    </div>
  );
}
