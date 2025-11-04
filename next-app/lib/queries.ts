'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getGamesByCodePrefix,
  getMatchupPageData,
  type MatchupPageData,
} from '@/app/actions/matchups';
import { getReactions, type ReactionData } from '@/app/actions/reactions';
import type { GameType } from '@/lib/definitions';
import { REFRESH_INTERVALS } from '@/lib/constants';

// Query keys factory
export const queryKeys = {
  games: (dateCode: string) => ['games', dateCode] as const,
  matchup: (code: string) => ['matchup', code] as const,
  reactions: (pickId: string) => ['reactions', pickId] as const,
};

/**
 * Query hook for fetching games by date code prefix
 */
export function useGamesByDateCode(
  dateCode: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
  }
) {
  return useQuery<GameType[]>({
    queryKey: queryKeys.games(dateCode),
    queryFn: async () => {
      return await getGamesByCodePrefix(dateCode);
    },
    enabled: options?.enabled !== false && !!dateCode,
    refetchInterval: options?.refetchInterval,
    staleTime: 30 * 1000, // 30 seconds - games data can change frequently
  });
}

/**
 * Query hook for fetching matchup page data
 */
export function useMatchupPageData(
  code: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
  }
) {
  return useQuery<MatchupPageData | null>({
    queryKey: queryKeys.matchup(code),
    queryFn: async () => {
      return await getMatchupPageData(code);
    },
    enabled: options?.enabled !== false && !!code,
    refetchInterval: options?.refetchInterval,
    staleTime: 30 * 1000, // 30 seconds - matchup data can change frequently
  });
}

/**
 * Query hook for fetching reactions for a pick
 */
export function useReactions(
  pickId: string,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery<ReactionData>({
    queryKey: queryKeys.reactions(pickId),
    queryFn: async () => {
      return await getReactions(pickId);
    },
    enabled: options?.enabled !== false && !!pickId,
    staleTime: 60 * 1000, // 1 minute - reactions don't change as frequently
  });
}

/**
 * Helper hook to determine refresh interval based on games scoreboard status
 * Returns refresh interval: 10 seconds if any game has a scoreboard, 60 seconds otherwise
 */
export function useGamesRefreshInterval(games: GameType[] | undefined): number {
  const hasScoreboard = games?.some((game) => game.scoreboard);
  return hasScoreboard
    ? REFRESH_INTERVALS.WITH_SCOREBOARD
    : REFRESH_INTERVALS.WITHOUT_SCOREBOARD;
}
