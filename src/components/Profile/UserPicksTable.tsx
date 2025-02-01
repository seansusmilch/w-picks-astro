import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { MatchupType, PickType } from '@/lib/definitions';
import { TeamMap } from '@/components/NBA/teamMap';
import { Logo } from '@/components/NBA/Logo';
import moment from 'moment';
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import { getUrlToMatchup } from '@/lib/data_common';

export function UserPicksTable({
  flags,
  picks,
  defaultTab,
}: {
  picks: PickType[];
  defaultTab: 'past' | 'live' | 'upcoming';
}) {
  const pastPicks = picks.filter((p) => p.status === 'past');
  const livePicks = picks.filter((p) => p.status === 'live');
  const upcomingPicks = picks.filter((p) => p.status === 'upcoming');

  return (
    <Tabs defaultValue={defaultTab}>
      <div className='flex justify-center'>
        <TabsList>
          <TabsTrigger value='past'>Past</TabsTrigger>
          <TabsTrigger value='live'>Live</TabsTrigger>
          <TabsTrigger value='upcoming'>Upcoming</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value='live'>
        <LivePicksTable picks={livePicks} />
      </TabsContent>
      <TabsContent value='upcoming'>
        <UpcomingPicksTable picks={upcomingPicks} />
      </TabsContent>
      <TabsContent value='past'>
        <PastPicksTable picks={pastPicks} />
      </TabsContent>
    </Tabs>
  );
}

function MatchupCell({ matchup }: { matchup: MatchupType }) {
  const awayTeamShort =
    TeamMap[matchup.away_code]?.name_short || matchup.away_code;
  const homeTeamShort =
    TeamMap[matchup.home_code]?.name_short || matchup.home_code;
  return (
    <div>
      <a href={getUrlToMatchup(matchup.code)} className='flex flex-col'>
        <div className='flex gap-4'>
          <Logo tricode={matchup.away_code} className='w-12 h-12' />
          <Logo tricode={matchup.home_code} className='w-12 h-12' />
        </div>
        <p className='text-lg'>
          {awayTeamShort} at {homeTeamShort}
        </p>
      </a>
    </div>
  );
}

function DateCell({ date }: { date: Date }) {
  return (
    <p className='text-xs text-muted-foreground'>
      {moment(date).format('MMM D')}
    </p>
  );
}

function PastPicksTable({ picks }: { picks: PickType[] }) {
  return picks.length ? (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>W/L</TableHead>
          <TableHead className='pr-4'>Date</TableHead>
          <TableHead>Matchup</TableHead>
          {/* <TableHead>Prediction</TableHead> */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {picks.map((p) => (
          <TableRow key={p.id}>
            <TableCell>
              <span
                className={`font-bold ${
                  p.result === 'W' ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {p.result}
              </span>
            </TableCell>
            <TableCell>
              <DateCell date={p.expand.matchup.time_utc} />
            </TableCell>
            <TableCell>
              <MatchupCell matchup={p.expand.matchup} />
              {p.comment && <CommentCell comment={p.comment} />}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ) : (
    <NoPicks type='past' />
  );
}

function LivePicksTable({ picks }: { picks: PickType[] }) {
  return picks.length ? (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Matchup</TableHead>
          <TableHead className='text-right'>Prediction</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {picks.map((p) => (
          <TableRow key={p.id}>
            <TableCell>
              <MatchupCell matchup={p.expand.matchup} />
              {p.comment && <CommentCell comment={p.comment} />}
            </TableCell>
            <TableCell className='flex items-start justify-end'>
              <Logo tricode={p.win_prediction} className='w-12 h-12' />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ) : (
    <NoPicks type='live' />
  );
}

function UpcomingPicksTable({ picks }: { picks: PickType[] }) {
  return picks.length ? (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='pr-4'>Date</TableHead>
          <TableHead>Matchup</TableHead>
          <TableHead className='text-right'>Prediction</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {picks
          .slice()
          .reverse()
          .map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <DateCell date={p.expand.matchup.time_utc} />
              </TableCell>
              <TableCell>
                <MatchupCell matchup={p.expand.matchup} />
                {p.comment && <CommentCell comment={p.comment} />}
              </TableCell>
              <TableCell className='flex items-start justify-end'>
                <Logo tricode={p.win_prediction} className='w-12 h-12' />
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  ) : (
    <NoPicks type='upcoming' />
  );
}

function NoPicks({ type }: { type: 'past' | 'live' | 'upcoming' }) {
  return (
    <p className='text-center text-gray-400'>No {type} picks at this time</p>
  );
}

function CommentCell({ comment }: { comment: string }) {
  return (
    <div className='flex gap-1 text-muted-foreground'>
      <ChatBubbleBottomCenterTextIcon className='w-4 h-4 shrink-0' />
      <span className='text-sm'>{comment}</span>
    </div>
  );
}
