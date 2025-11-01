'use client';

import type { MatchupType, PickType } from '@/lib/definitions';
import { UserAvatar } from '@/components/profile/user-avatar';

interface PicksSummaryProps {
  picks: PickType[];
  matchup: MatchupType;
}

export function PicksSummary({ picks, matchup }: PicksSummaryProps) {
  const { home_code, away_code } = matchup;
  const homePicks = picks.filter((pick) => pick.win_prediction === home_code);
  const awayPicks = picks.filter((pick) => pick.win_prediction === away_code);

  return (
    <div className="flex w-full gap-1">
      <div className="flex-1 flex items-center gap-2 justify-between pl-2 sm:pl-4">
        <div className="grow flex -space-x-2 items-center justify-center">
          {awayPicks.slice(0, 3).map((pick) => (
            <UserAvatar
              key={pick.id}
              className="w-7 h-7 sm:w-8 sm:h-8"
              avatarUrl={pick.expand?.user?.avatar_url}
              username={pick.expand?.user?.username}
            />
          ))}
        </div>
        <span className="text-sm sm:text-base font-bold">{awayPicks.length}</span>
      </div>
      {/* Divider */}
      <div className="w-px bg-border self-stretch mx-1" />
      {/* Home team picks */}
      <div className="flex-1 flex items-center gap-2 justify-between pr-2 sm:pr-4">
        <span className="text-sm sm:text-base font-bold">{homePicks.length}</span>
        <div className="grow flex -space-x-2 items-center justify-center">
          {homePicks.slice(0, 3).map((pick) => (
            <UserAvatar
              key={pick.id}
              className="w-7 h-7 sm:w-8 sm:h-8"
              avatarUrl={pick.expand?.user?.avatar_url}
              username={pick.expand?.user?.username}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

