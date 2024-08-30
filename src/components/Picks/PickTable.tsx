import clsx from 'clsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type PickType, PickZ, type MatchupType } from '@/lib/definitions';
import { z } from 'astro/zod';
import type { ListResult, RecordModel } from 'pocketbase';

const PicksZ = z.array(PickZ);

export function PickTable({
  matchup,
  picks,
}: {
  matchup: MatchupType;
  picks: RecordModel[];
}) {
  // can add db realtime subscriptions for picks here or down in separate components
  const awayPicks = picks.filter(
    (pick) => pick.win_prediction === matchup.away_code
  );
  const homePicks = picks.filter(
    (pick) => pick.win_prediction === matchup.home_code
  );

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
          <div className='basis-1/2 flex flex-col'>
            {awayPicks.map((pick) => (
              <AwayPick key={pick.id} pick={pick} />
            ))}
          </div>
          <div className='basis-1/2 flex flex-col'>
            {homePicks.map((pick) => (
              <HomePick key={pick.id} pick={pick} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AwayPick({ pick }: { pick: RecordModel }) {
  console.log('avatar', pick.expand.user.avatar);
  return (
    <div className='flex flex-row p-1 gap-2 border'>
      <Avatar>
        <AvatarImage src='https://i.pravatar.cc/300' />
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
      <div className='flex-grow flex flex-col'>
        <p className='text-xs font-semibold'>{pick.expand.user.username}</p>
        <p className='text-sm'>{pick.comment}</p>
      </div>
    </div>
  );
}

function HomePick({ pick }: { pick: RecordModel }) {
  return (
    <div className='flex flex-row p-1 gap-2 border'>
      <div className='flex-grow flex flex-col'>
        <p className='text-xs font-semibold'>{pick.expand.user.username}</p>
        <p className='text-sm'>{pick.comment}</p>
      </div>
      <Avatar>
        <AvatarImage src='https://i.pravatar.cc/300' />
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
    </div>
  );
}
