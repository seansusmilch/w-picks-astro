import type { MatchupType, PickType } from '@/lib/definitions';
import { UserAvatar } from '../Profile/UserAvatar';

export function PicksSummary({
  picks,
  matchup,
}: {
  picks: PickType[];
  matchup: MatchupType;
}) {
  const { home_code, away_code } = matchup;
  const homePicks = picks.filter((pick) => pick.win_prediction === home_code);
  const awayPicks = picks.filter((pick) => pick.win_prediction === away_code);

  return (
    <div className='flex w-full gap-1'>
      <div className='flex-1 flex items-center gap-2 justify-between'>
        <div className='flex -space-x-2'>
          {awayPicks.slice(0, 3).map((pick) => (
            <UserAvatar
              key={pick.id}
              className='w-6 h-6'
              avatar_url={pick.expand.user.avatar_url}
            />
          ))}
        </div>
        <span className='text-md'>{awayPicks.length}</span>
      </div>
      {/* Divider */}
      <div className='w-px bg-border self-stretch mx-1' />
      {/* Home team picks */}

      <div className='flex-1 flex items-center gap-2 justify-between'>
        <span className='text-md'>{homePicks.length}</span>
        <div className='flex justify-end -space-x-2'>
          {homePicks.slice(0, 3).map((pick) => (
            <UserAvatar
              key={pick.id}
              className='w-6 h-6'
              avatar_url={pick.expand.user.avatar_url}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
