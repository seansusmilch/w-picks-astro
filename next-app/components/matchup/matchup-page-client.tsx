'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MatchupRibbon } from './matchup-ribbon';
import { MatchupDisplay } from './matchup-display';
import { PicksSummary } from './picks-summary';
import { PickForm } from './pick-form';
import { PicksView } from './picks-view';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type {
  GameType,
  MatchupType,
  ScoreboardType,
  PickType,
} from '@/lib/definitions';

interface MatchupPageData {
  matchup: MatchupType;
  scoreboard: ScoreboardType | null;
  picks: PickType[];
}

interface MatchupPageClientProps {
  initialGames: GameType[];
  initialData: MatchupPageData;
  initialDateCode: string;
  initialGameCode: string;
  userPick?: PickType;
  scoreboardStatus?: number;
}

export function MatchupPageClient({
  initialGames,
  initialData,
  initialDateCode,
  initialGameCode,
  userPick,
  scoreboardStatus = 0,
}: MatchupPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [dateCode, setDateCode] = useState<string>(initialDateCode);
  const [gameCode, setGameCode] = useState<string>(initialGameCode);
  const [games, setGames] = useState<GameType[]>(initialGames);
  const [dataByCode, setDataByCode] = useState<Map<string, MatchupPageData>>(
    () => new Map([[`${initialDateCode}/${initialGameCode}`, initialData]])
  );
  const [loading, setLoading] = useState<boolean>(false);

  const selectedCode = `${dateCode}/${gameCode}`;
  const currentData = dataByCode.get(selectedCode) || initialData;
  const currentMatchup = currentData.matchup as MatchupType;
  const currentScoreboard = currentData.scoreboard;
  const currentPicks = currentData.picks;

  const updateUrl = useCallback(
    (nextDate: string, nextGame: string) => {
      const params = new URLSearchParams();
      params.set('date', nextDate);
      params.set('game', nextGame);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router]
  );

  const fetchGamesForDate = useCallback(async (nextDate: string) => {
    const res = await fetch(`/api/games/${nextDate}`, { cache: 'no-store' });
    if (!res.ok) return [] as GameType[];
    const json = await res.json();
    return (json?.games || []) as GameType[];
  }, []);

  const fetchMatchupData = useCallback(
    async (nextDate: string, nextGame: string) => {
      const res = await fetch(`/api/matchup/${nextDate}/${nextGame}`, {
        cache: 'no-store',
      });
      if (!res.ok) return null as MatchupPageData | null;
      const json = await res.json();
      return (json || null) as MatchupPageData | null;
    },
    []
  );

  const handleSelectGame = useCallback(
    async (game: GameType) => {
      const [nextDate, nextGame] = game.matchup.code.split('/');
      if (nextDate === dateCode && nextGame === gameCode) return;

      setDateCode(nextDate);
      setGameCode(nextGame);
      updateUrl(nextDate, nextGame);

      // Ensure we have games for this date (for ribbon)
      if (nextDate !== dateCode) {
        const newGames = await fetchGamesForDate(nextDate);
        setGames(newGames);
      }

      const key = `${nextDate}/${nextGame}`;
      if (!dataByCode.get(key)) {
        setLoading(true);
        const nextData = await fetchMatchupData(nextDate, nextGame);
        if (nextData) {
          setDataByCode((prev) => new Map(prev).set(key, nextData));
        }
        setLoading(false);
      }
    },
    [
      dateCode,
      gameCode,
      dataByCode,
      updateUrl,
      fetchGamesForDate,
      fetchMatchupData,
    ]
  );

  // Find the current user's pick from the picks list
  // This ensures we always have the latest pick data after refetches
  const userPickForCurrent = useMemo(() => {
    // First try to find from currentPicks (most up-to-date)
    if (userPick?.user) {
      const foundPick = currentPicks.find((p) => p.user === userPick.user);
      if (foundPick) return foundPick;
    }
    // Fallback to userPick prop if not found in currentPicks
    return userPick;
  }, [currentPicks, userPick]);

  // Refetch matchup data to update picks list instantly with optimistic updates
  const refetchMatchupData = useCallback(
    async (optimisticPick?: PickType) => {
      if (!gameCode || !dateCode) return;

      // Optimistically update picks list immediately for instant feedback
      if (optimisticPick) {
        const key = `${dateCode}/${gameCode}`;
        setDataByCode((prev) => {
          const currentData = prev.get(key) || initialData;
          const existingPicks = currentData.picks;

          // Check if pick already exists (update) or needs to be added
          // Prioritize matching by ID if available, then by user
          const pickIndex = existingPicks.findIndex((p) => {
            if (optimisticPick.id && p.id === optimisticPick.id) return true;
            if (p.user === optimisticPick.user) return true;
            return false;
          });

          let updatedPicks: PickType[];
          if (pickIndex >= 0) {
            // Update existing pick - replace it entirely with the new optimistic pick
            updatedPicks = [...existingPicks];
            updatedPicks[pickIndex] = optimisticPick;
          } else {
            // Add new pick (if it's not indeterminate)
            if (optimisticPick.win_prediction !== 'indeterminate') {
              updatedPicks = [...existingPicks, optimisticPick];
            } else {
              // Remove pick if indeterminate (deletion)
              updatedPicks = existingPicks.filter(
                (p) => p.user !== optimisticPick.user
              );
            }
          }

          return new Map(prev).set(key, {
            ...currentData,
            picks: updatedPicks,
          });
        });
      }

      // Then refetch to sync with server
      const newData = await fetchMatchupData(dateCode, gameCode);
      if (newData) {
        const key = `${dateCode}/${gameCode}`;
        setDataByCode((prev) => new Map(prev).set(key, newData));
      }
    },
    [dateCode, gameCode, fetchMatchupData, initialData]
  );

  return (
    <>
      <MatchupRibbon
        games={games}
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
                <div className='animate-pulse space-y-4'>
                  <div className='h-6 bg-muted rounded w-1/3' />
                  <div className='h-24 bg-muted rounded' />
                  <div className='h-4 bg-muted rounded w-1/2' />
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
