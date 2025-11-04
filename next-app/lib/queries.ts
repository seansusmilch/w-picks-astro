'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getGamesByCodePrefix,
  getMatchupPageData,
  type MatchupPageData,
} from '@/app/actions/matchups';
import { getReactions, type ReactionData } from '@/app/actions/reactions';
import type { GameType } from '@/lib/definitions';

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
 * Helper hook to check if games are live (for polling)
 */
export function useGamesPolling(games: GameType[] | undefined) {
  const hasLiveGames = games?.some(
    (game) =>
      game.scoreboard?.status === 1 || game.scoreboard?.status === 2
  );

  return hasLiveGames ? 5000 : false; // Poll every 5 seconds if live games exist
}

