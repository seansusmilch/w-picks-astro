'use client';

import { useState, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { MatchupType, PickType } from '@/lib/definitions';
import { TeamMap } from '@/components/nba/team-map';
import { Logo } from '@/components/nba/logo';
import { DateTime } from 'luxon';
import { MessageCircleIcon } from 'lucide-react';

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const dt = DateTime.fromISO(dateStr);
  return dt.isValid ? dt.toFormat('MMM d') : '';
}

export function UserPicksTable({
  picks,
  defaultTab,
}: {
  picks: PickType[];
  defaultTab: 'past' | 'live' | 'upcoming';
}) {
  const pastPicks = picks.filter((p) => p.status === 'past');
  const livePicks = picks.filter((p) => p.status === 'live');
  const upcomingPicks = picks.filter((p) => p.status === 'upcoming');

  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    const saved = localStorage.getItem('userPicksTab');
    if (saved && ['past', 'live', 'upcoming'].includes(saved)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(saved as 'past' | 'live' | 'upcoming');
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'past' | 'live' | 'upcoming');
    localStorage.setItem('userPicksTab', value);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <div className='flex justify-center'>
        <TabsList>
          <TabsTrigger value='past'>Past ({pastPicks.length})</TabsTrigger>
          <TabsTrigger value='live'>Live ({livePicks.length})</TabsTrigger>
          <TabsTrigger value='upcoming'>Upcoming ({upcomingPicks.length})</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value='past'>
        <VirtualizedPicksList picks={pastPicks} type='past' />
      </TabsContent>
      <TabsContent value='live'>
        <VirtualizedPicksList picks={livePicks} type='live' />
      </TabsContent>
      <TabsContent value='upcoming'>
        <VirtualizedPicksList picks={upcomingPicks} type='upcoming' />
      </TabsContent>
    </Tabs>
  );
}

function VirtualizedPicksList({
  picks,
  type,
}: {
  picks: PickType[];
  type: 'past' | 'live' | 'upcoming';
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  const displayPicks = type === 'upcoming' ? picks.slice().reverse() : picks;

  const rowVirtualizer = useVirtualizer({
    count: displayPicks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  if (!displayPicks.length) {
    return (
      <p className='text-center text-muted-foreground py-4'>
        No {type} picks at this time
      </p>
    );
  }

  return (
    <div ref={parentRef} className='max-h-[500px] overflow-y-auto'>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const pick = displayPicks[virtualRow.index];
          const dateStr = pick.expand?.matchup?.time_utc ?? '';
          const formattedDate = formatDate(dateStr);

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              className='flex items-center gap-3 py-2 px-1'
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {formattedDate && (
                <span className='text-xs text-muted-foreground w-12 shrink-0'>
                  {formattedDate}
                </span>
              )}

              <div className='flex-1 min-w-0'>
                {pick.expand?.matchup && (
                  <MatchupInfo matchup={pick.expand.matchup} />
                )}
                {pick.comment && <CommentCell comment={pick.comment} />}
              </div>

              <div className='shrink-0 flex items-center'>
                {type === 'past' ? (
                  <span
                    className={`font-bold text-sm ${
                      pick.result === 'W'
                        ? 'text-primary'
                        : 'text-destructive'
                    }`}
                  >
                    {pick.result || '-'}
                  </span>
                ) : (
                  <Logo tricode={pick.win_prediction} className='w-10 h-10' />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MatchupInfo({ matchup }: { matchup: MatchupType }) {
  const awayTeamShort =
    TeamMap[matchup.away_code as keyof typeof TeamMap]?.name_short ||
    matchup.away_code;
  const homeTeamShort =
    TeamMap[matchup.home_code as keyof typeof TeamMap]?.name_short ||
    matchup.home_code;

  return (
    <a
      href={`/matchup/${matchup.code}`}
      className='flex items-center gap-2 hover:opacity-80 transition-opacity'
    >
      <div className='flex gap-1'>
        <Logo tricode={matchup.away_code} className='w-8 h-8' />
        <Logo tricode={matchup.home_code} className='w-8 h-8' />
      </div>
      <span className='text-sm'>
        {awayTeamShort} at {homeTeamShort}
      </span>
    </a>
  );
}

function CommentCell({ comment }: { comment: string }) {
  return (
    <div className='flex gap-1 text-muted-foreground mt-0.5'>
      <MessageCircleIcon className='w-3 h-3 shrink-0 mt-0.5' />
      <span className='text-xs break-words whitespace-pre-wrap line-clamp-2'>
        {comment}
      </span>
    </div>
  );
}
