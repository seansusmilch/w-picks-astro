import { useState, useEffect } from 'react';
import { UserAvatar } from '@/components/Profile/UserAvatar';
import { getUrlToMatchup } from '@/lib/data_common';
import { Logo } from '@/components/NBA/Logo';
import { TeamMap } from '@/components/NBA/teamMap';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline';
import moment from 'moment';
import { cn } from '@/lib/utils';
import type { PickType } from '@/lib/definitions';

export function LatestPicksView({ picks }: { picks: PickType[] }) {
  return (
    <div className='w-full max-w-2xl mx-auto'>
      <h2 className='text-2xl font-bold'>Latest Picks</h2>
      <div className='space-y-4'>
        {picks.length === 0 ? (
          <div className='text-center py-8 text-muted-foreground'>
            No picks available
          </div>
        ) : (
          picks.map((pick) => <PickCard key={pick.id} pick={pick} />)
        )}
      </div>
    </div>
  );
}

function PickCard({ pick }: { pick: any }) {
  const user = pick.expand.user;
  const matchup = pick.expand.matchup;
  const isPredictionHome = pick.win_prediction === matchup.home_code;
  const teamCode = pick.win_prediction;
  const teamName = TeamMap[teamCode]?.name || teamCode;
  const matchupUrl = getUrlToMatchup(matchup.code);
  const createdAt = moment(pick.created).fromNow();

  return (
    <Card className='hover:bg-muted/50 transition-colors'>
      <CardHeader className='pb-2 pt-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <UserAvatar className='w-10 h-10' avatar_url={user.avatar_url} />
            <div className='font-medium'>{user.username}</div>
          </div>
          <div className='text-xs text-muted-foreground flex items-center gap-1'>
            <CalendarIcon className='h-3 w-3' />
            {createdAt}
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-3'>
        <div className='flex items-center gap-2 text-sm'>
          <span>Picked</span>
          <div className='flex items-center gap-1 font-medium'>
            <Logo tricode={teamCode} className='h-5 w-5' />
            {teamName}
          </div>
          <span>to win</span>
        </div>

        {pick.comment && (
          <div className='text-sm bg-muted/30 p-2 rounded-md'>
            <div className='flex items-start gap-1'>
              <ChatBubbleBottomCenterTextIcon className='h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground' />
              <p>{pick.comment}</p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className='pt-0'>
        <a href={matchupUrl} className='text-xs text-primary hover:underline'>
          View matchup
        </a>
      </CardFooter>
    </Card>
  );
}
