'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { MatchupRibbon } from './matchup-ribbon';
import { MatchupDisplay } from './matchup-display';
import { PicksSummary } from './picks-summary';
import { PickForm } from './pick-form';
import { PicksView } from './picks-view';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type {
  GameType,
  MatchupType,
  PickType,
} from '@/lib/definitions';
import type { MatchupPageData } from '@/app/actions/matchups';
import {
  useMatchupPageData,
  useGamesByDateCode,
  queryKeys,
} from '@/lib/queries';
import { REFRESH_INTERVALS } from '@/lib/constants';

interface MatchupPageClientProps {
  initialGames: GameType[];
  initialData: MatchupPageData;
  initialDateCode: string;
  initialGameCode: string;
  userId: string;
  userPick?: PickType;
  scoreboardStatus?: number;
}

export function MatchupPageClient({
  initialGames,
  initialData,
  initialDateCode,
  initialGameCode,
  userId,
  userPick,
  scoreboardStatus = 0,
}: MatchupPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const [dateCode, setDateCode] = useState<string>(initialDateCode);
  const [gameCode, setGameCode] = useState<string>(initialGameCode);
  const [displayedCode, setDisplayedCode] = useState<string>(
    `${initialDateCode}/${initialGameCode}`
  );

  const selectedCode = `${dateCode}/${gameCode}`;

  // Hydrate initial data into React Query cache
  useEffect(() => {
    queryClient.setQueryData(queryKeys.matchup(selectedCode), initialData);
    queryClient.setQueryData(queryKeys.games(initialDateCode), initialGames);
  }, [queryClient, selectedCode, initialData, initialDateCode, initialGames]);

  // Get current matchup data from React Query
  // Refresh interval dynamically adjusts based on scoreboard presence
  const {
    data: currentMatchupData,
    isLoading: isLoadingMatchup,
    isFetching: isFetchingMatchup,
  } = useMatchupPageData(selectedCode, {
    enabled: !!gameCode,
    refetchInterval: (query) => {
      // Dynamically determine interval based on current query data
      const data = query.state.data as MatchupPageData | null | undefined;
      const hasScoreboard = !!data?.scoreboard;
      return hasScoreboard
        ? REFRESH_INTERVALS.WITH_SCOREBOARD
        : REFRESH_INTERVALS.WITHOUT_SCOREBOARD;
    },
  });

  // Get games for current date
  const {
    data: games,
    isLoading: isLoadingGames,
  } = useGamesByDateCode(dateCode, {
    enabled: !!dateCode,
  });

  // Update displayed code when new matchup data is ready
  useEffect(() => {
    const cachedData = queryClient.getQueryData<MatchupPageData | null>(
      queryKeys.matchup(selectedCode)
    );
    
    if (
      (currentMatchupData || cachedData) &&
      selectedCode === `${dateCode}/${gameCode}` &&
      displayedCode !== selectedCode
    ) {
      // New matchup data is ready (either from query or cache), update displayed code
      setDisplayedCode(selectedCode);
    }
  }, [currentMatchupData, selectedCode, dateCode, gameCode, displayedCode, queryClient]);

  // Check if we have data cached for the selected matchup
  const hasCachedData = !!queryClient.getQueryData<MatchupPageData | null>(
    queryKeys.matchup(selectedCode)
  );

  // Determine if we should show loading skeleton
  // Show skeleton only when:
  // 1. We're switching to a different matchup (displayedCode !== selectedCode), AND
  // 2. We don't have cached data for the new matchup yet
  const isLoadingNewMatchup =
    displayedCode !== selectedCode && !hasCachedData && (isLoadingMatchup || isFetchingMatchup);

  // Use data for the displayed matchup to prevent flickering
  // Keep showing old matchup until new one loads
  const displayedMatchupData =
    displayedCode === selectedCode && currentMatchupData
      ? currentMatchupData
      : queryClient.getQueryData<MatchupPageData | null>(
          queryKeys.matchup(displayedCode)
        ) || (displayedCode === `${initialDateCode}/${initialGameCode}` ? initialData : null) || initialData;

  const currentData = displayedMatchupData;
  const currentMatchup = currentData.matchup as MatchupType;
  const currentScoreboard = currentData.scoreboard;
  const currentPicks = currentData.picks;
  const currentGames = games || initialGames;
  const loading = isLoadingNewMatchup;

  const updateUrl = useCallback(
    (nextDate: string, nextGame: string) => {
      const params = new URLSearchParams();
      params.set('date', nextDate);
      params.set('game', nextGame);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router]
  );

  const handleSelectGame = useCallback(
    (game: GameType) => {
      const [nextDate, nextGame] = game.matchup.code.split('/');
      if (nextDate === dateCode && nextGame === gameCode) return;

      const nextCode = `${nextDate}/${nextGame}`;

      setDateCode(nextDate);
      setGameCode(nextGame);
      updateUrl(nextDate, nextGame);

      // Prefetch matchup data immediately to minimize loading time
      queryClient.prefetchQuery({
        queryKey: queryKeys.matchup(nextCode),
        queryFn: async () => {
          const { getMatchupPageData } = await import('@/app/actions/matchups');
          return await getMatchupPageData(nextCode);
        },
      });

      // Prefetch games for the new date if needed
      if (nextDate !== dateCode) {
        queryClient.prefetchQuery({
          queryKey: queryKeys.games(nextDate),
          queryFn: async () => {
            const { getGamesByCodePrefix } = await import('@/app/actions/matchups');
            return await getGamesByCodePrefix(nextDate);
          },
        });
      }
    },
    [dateCode, gameCode, updateUrl, queryClient]
  );

  // Find the current user's pick from the picks list
  // This ensures we always have the latest pick data after refetches
  const userPickForCurrent = useMemo(() => {
    const foundPick = currentPicks.find((p) => p.user === userId);
    if (foundPick) return foundPick;

    if (
      userPick &&
      userPick.user === userId &&
      displayedCode === `${initialDateCode}/${initialGameCode}`
    ) {
      return userPick;
    }

    return undefined;
  }, [
    currentPicks,
    userId,
    userPick,
    displayedCode,
    initialDateCode,
    initialGameCode,
  ]);

  // Refetch matchup data - mutations will handle optimistic updates
  const refetchMatchupData = useCallback(
    async (optimisticPick?: PickType) => {
      if (!gameCode || !dateCode) return;
      // Mutations handle optimistic updates, so we just need to refetch
      await queryClient.invalidateQueries({
        queryKey: queryKeys.matchup(selectedCode),
      });
    },
    [dateCode, gameCode, selectedCode, queryClient]
  );

  return (
    <>
      <MatchupRibbon
        games={currentGames}
        currentGameCode={gameCode}
        dateCode={dateCode}
        onSelectGame={handleSelectGame}
      />

      <div className='container mx-auto p-4 py-6 sm:py-8 max-w-2xl'>
        {!gameCode ? (
          <Card className='mb-4 sm:mb-6'>
            <CardContent className='p-6 text-center text-muted-foreground'>
              No games scheduled.
            </CardContent>
          </Card>
        ) : (
          <Card className='mb-4 sm:mb-6'>
            <CardContent className='p-4 sm:p-6'>
              {loading ? (
                <div className='animate-pulse'>
                  {/* MatchupDisplay skeleton */}
                  <div className='w-full flex items-center gap-2 sm:gap-4'>
                    {/* Away logo */}
                    <div className='h-12 w-12 sm:h-16 sm:w-16 bg-muted rounded shrink-0' />
                    {/* Center content */}
                    <div className='flex-1 flex flex-col items-center justify-center gap-1'>
                      <div className='h-4 bg-muted rounded w-24' />
                      <div className='h-5 sm:h-6 bg-muted rounded w-20' />
                    </div>
                    {/* Home logo */}
                    <div className='h-12 w-12 sm:h-16 sm:w-16 bg-muted rounded shrink-0' />
                  </div>
                  {/* Separator skeleton */}
                  <div className='h-px bg-border self-stretch my-3 sm:my-4' />
                  {/* PicksSummary skeleton */}
                  <div className='flex w-full gap-1 items-center'>
                    {/* Away team */}
                    <div className='flex-1 flex items-center gap-2 justify-between pl-2 sm:pl-4'>
                      <div className='grow flex -space-x-2 items-center justify-center'>
                        <div className='h-7 w-7 sm:h-8 sm:w-8 bg-muted rounded-full' />
                        <div className='h-7 w-7 sm:h-8 sm:w-8 bg-muted rounded-full' />
                        <div className='h-7 w-7 sm:h-8 sm:w-8 bg-muted rounded-full' />
                      </div>
                      <div className='h-4 sm:h-5 bg-muted rounded w-6' />
                    </div>
                    {/* Divider */}
                    <div className='w-px bg-border self-stretch mx-1' />
                    {/* Home team */}
                    <div className='flex-1 flex items-center gap-2 justify-between pr-2 sm:pr-4'>
                      <div className='h-4 sm:h-5 bg-muted rounded w-6' />
                      <div className='grow flex -space-x-2 items-center justify-center'>
                        <div className='h-7 w-7 sm:h-8 sm:w-8 bg-muted rounded-full' />
                        <div className='h-7 w-7 sm:h-8 sm:w-8 bg-muted rounded-full' />
                        <div className='h-7 w-7 sm:h-8 sm:w-8 bg-muted rounded-full' />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <MatchupDisplay
                    matchup={currentMatchup}
                    scoreboard={currentScoreboard || undefined}
                  />
                  {currentPicks.length > 0 && (
                    <>
                      <div className='h-px bg-border self-stretch my-3 sm:my-4' />
                      <PicksSummary
                        picks={currentPicks}
                        matchup={currentMatchup}
                      />
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {gameCode && (
          <Card className='mb-4 sm:mb-6'>
            <CardContent className='p-4 sm:p-6'>
              <PickForm
                matchup={currentMatchup}
                pick={userPickForCurrent}
                scoreboardStatus={scoreboardStatus}
                onPickUpdate={refetchMatchupData}
              />
            </CardContent>
          </Card>
        )}

        {gameCode && currentPicks.length > 0 && (
          <Card>
            <CardHeader className='pb-3 sm:pb-4'>
              <CardTitle className='text-base sm:text-lg'>All Picks</CardTitle>
            </CardHeader>
            <CardContent className='p-4 sm:p-6'>
              <PicksView picks={currentPicks} />
            </CardContent>
          </Card>
        )}

        {gameCode && currentPicks.length === 0 && (
          <Card>
            <CardContent className='p-6 sm:p-8 text-center'>
              <p className='text-sm sm:text-base text-muted-foreground'>
                No picks yet for this matchup
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
