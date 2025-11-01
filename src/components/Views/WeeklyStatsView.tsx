'use client';

import {
  Leaderboard,
  LeaderboardSkeleton,
} from '@/components/Stats/Leaderboard';
import { useStore } from '@nanostores/react';
import { queryClient } from '@/stores/query';
import { useQuery } from '@tanstack/react-query';
import { getWeeklyStatsAction } from '@/actions/stats';
import { getGamesByCodePrefix } from '@/actions';
import { useState } from 'react';
import { WeekSelect } from '@/components/Stats/WeekSelect';
import type { GameType } from '@/lib/definitions';
import { DateTime } from 'luxon';
import {
  WeekGamesSummary,
  WeekGamesSummarySkeleton,
} from '@/components/Stats/WeekGamesSummary';

interface WeeklyStatsViewProps {
  initialData: any[];
  initialWeek: string;
  weekList: string[];
}

function getCodePrefixesFromWeek(year_week: string): string[] {
  const [year, week] = year_week.split('-W');
  const startOfWeek = DateTime.fromObject({
    weekYear: parseInt(year),
    weekNumber: parseInt(week) + 1,
  });

  const codePrefixes = [];
  for (let i = 0; i < 7; i++) {
    const date = startOfWeek.plus({ days: i });
    const codePrefix = date.toFormat('yyyyMMdd');
    codePrefixes.push(codePrefix);
  }

  return codePrefixes;
}

export function WeeklyStatsView({
  initialData,
  initialWeek,
  weekList,
}: WeeklyStatsViewProps) {
  const client = useStore(queryClient);
  const [selectedWeek, setSelectedWeek] = useState<string>(initialWeek);

  const { data: weeklyStats, isLoading: isWeeklyStatsLoading } = useQuery(
    {
      queryKey: ['weeklyStats', selectedWeek],
      queryFn: async () => {
        try {
          const data = await getWeeklyStatsAction({
            week: selectedWeek,
          });
          return data;
        } catch (err: any) {
          throw new Error(err.message || 'Failed to fetch weekly stats');
        }
      },
      initialData: selectedWeek === initialWeek ? initialData : undefined,
      staleTime: 1000 * 10,
      gcTime: 1000 * 60 * 60 * 24,
    },
    client
  );

  const { data: weekGames, isLoading: isWeekGamesLoading } = useQuery<
    GameType[]
  >(
    {
      queryKey: ['games', selectedWeek],
      queryFn: async () => {
        const codePrefixes = getCodePrefixesFromWeek(selectedWeek);
        const games = await Promise.all(
          codePrefixes.map(async (codePrefix) => {
            try {
              const data = await getGamesByCodePrefix({
                codePrefix,
              });
              return data;
            } catch (err: any) {
              throw new Error(err.message || 'Failed to fetch games');
            }
          })
        );

        return games.flat();
      },
      refetchInterval: 5000,
      staleTime: 1000 * 30,
      gcTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: true,
    },
    client
  );

  return (
    <div className='w-full flex flex-col gap-4'>
      <WeekSelect
        selectedWeek={selectedWeek}
        weekList={weekList}
        onWeekChange={setSelectedWeek}
      />
      {isWeeklyStatsLoading ? (
        <LeaderboardSkeleton />
      ) : (
        <Leaderboard data={weeklyStats} />
      )}
      <WeekGamesSummary games={weekGames} isLoading={isWeekGamesLoading} />
    </div>
  );
}

/**
 * Skeleton loading state for the WeeklyStatsView component
 */
export function WeeklyStatsViewSkeleton() {
  return (
    <div className='w-full flex flex-col gap-4'>
      {/* Week Select Skeleton */}
      <div className='w-full max-w-xs'>
        <div className='h-10 w-full rounded-md bg-muted animate-pulse' />
      </div>

      {/* Leaderboard Skeleton */}
      <LeaderboardSkeleton />

      {/* Week Games Summary Skeleton */}
      <WeekGamesSummarySkeleton />
    </div>
  );
}
