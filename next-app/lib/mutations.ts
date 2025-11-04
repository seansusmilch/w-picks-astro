'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  submitPickAction,
  deletePickAction,
  type SubmitPickFormState,
  type DeletePickFormState,
} from '@/app/actions/picks';
import {
  addReaction,
  removeReaction,
  type ReactionData,
} from '@/app/actions/reactions';
import type { MatchupPageData } from '@/app/actions/matchups';
import { queryKeys } from './queries';
import type { PickType } from '@/lib/definitions';

/**
 * Submit or update a pick mutation
 */
export function useSubmitPick() {
  const queryClient = useQueryClient();

  return useMutation<
    SubmitPickFormState,
    Error,
    {
      id?: string;
      win_prediction: string;
      comment?: string;
      matchup: string;
      matchupCode?: string; // For optimistic updates
      optimisticPick?: PickType; // For optimistic updates
    }
  >({
    mutationFn: async (variables) => {
      const formData = new FormData();
      if (variables.id) {
        formData.append('id', variables.id);
      }
      formData.append('win_prediction', variables.win_prediction);
      if (variables.comment) {
        formData.append('comment', variables.comment);
      }
      formData.append('matchup', variables.matchup);

      return await submitPickAction(undefined, formData);
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      if (variables.matchupCode) {
        await queryClient.cancelQueries({
          queryKey: queryKeys.matchup(variables.matchupCode),
        });
      }

      // Snapshot previous value for rollback
      let previousMatchupData: any = null;
      if (variables.matchupCode) {
        previousMatchupData = queryClient.getQueryData<MatchupPageData | null>(
          queryKeys.matchup(variables.matchupCode)
        );
      }

      // Optimistically update matchup data if we have optimistic pick
      if (variables.matchupCode && variables.optimisticPick) {
        const matchupData = queryClient.getQueryData<MatchupPageData | null>(
          queryKeys.matchup(variables.matchupCode)
        );

        if (matchupData) {
          const existingPicks = matchupData.picks || [];
          const pickIndex = existingPicks.findIndex(
            (p) =>
              (variables.optimisticPick!.id && p.id === variables.optimisticPick!.id) ||
              p.user === variables.optimisticPick!.user
          );

          let updatedPicks: PickType[];
          if (pickIndex >= 0) {
            // Update existing pick
            updatedPicks = [...existingPicks];
            updatedPicks[pickIndex] = variables.optimisticPick;
          } else {
            // Add new pick (if not indeterminate)
            if (variables.optimisticPick.win_prediction !== 'indeterminate') {
              updatedPicks = [...existingPicks, variables.optimisticPick];
            } else {
              // Remove pick if indeterminate
              updatedPicks = existingPicks.filter(
                (p) => p.user !== variables.optimisticPick!.user
              );
            }
          }

          queryClient.setQueryData<MatchupPageData | null>(
            queryKeys.matchup(variables.matchupCode),
            {
              ...matchupData,
              picks: updatedPicks,
            }
          );
        }
      }

      return { previousMatchupData };
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch matchup queries
      if (variables.matchupCode) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.matchup(variables.matchupCode),
        });
      }
      // Also invalidate games queries that might include this matchup
      queryClient.invalidateQueries({
        queryKey: ['games'],
      });
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (variables.matchupCode && context?.previousMatchupData) {
        queryClient.setQueryData<MatchupPageData | null>(
          queryKeys.matchup(variables.matchupCode),
          context.previousMatchupData
        );
      }
    },
  });
}

/**
 * Delete a pick mutation
 */
export function useDeletePick() {
  const queryClient = useQueryClient();

  return useMutation<
    DeletePickFormState,
    Error,
    {
      id: string;
      matchup: string;
      matchupCode?: string; // For optimistic updates
      userId?: string; // For optimistic updates
    }
  >({
    mutationFn: async (variables) => {
      const formData = new FormData();
      formData.append('id', variables.id);
      formData.append('matchup', variables.matchup);

      return await deletePickAction(undefined, formData);
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      if (variables.matchupCode) {
        await queryClient.cancelQueries({
          queryKey: queryKeys.matchup(variables.matchupCode),
        });
      }

      // Snapshot previous value
      let previousMatchupData: any = null;
      if (variables.matchupCode) {
        previousMatchupData = queryClient.getQueryData<MatchupPageData | null>(
          queryKeys.matchup(variables.matchupCode)
        );
      }

      // Optimistically remove pick
      if (variables.matchupCode && variables.userId) {
        const matchupData = queryClient.getQueryData<MatchupPageData | null>(
          queryKeys.matchup(variables.matchupCode)
        );

        if (matchupData) {
          queryClient.setQueryData<MatchupPageData | null>(
            queryKeys.matchup(variables.matchupCode),
            {
              ...matchupData,
              picks: matchupData.picks.filter((p) => p.user !== variables.userId),
            }
          );
        }
      }

      return { previousMatchupData };
    },
    onSuccess: (data, variables) => {
      // Invalidate queries
      if (variables.matchupCode) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.matchup(variables.matchupCode),
        });
      }
      queryClient.invalidateQueries({
        queryKey: ['games'],
      });
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (variables.matchupCode && context?.previousMatchupData) {
        queryClient.setQueryData<MatchupPageData | null>(
          queryKeys.matchup(variables.matchupCode),
          context.previousMatchupData
        );
      }
    },
  });
}

/**
 * Add reaction mutation
 */
export function useAddReaction() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (pickId: string) => {
      return await addReaction(pickId);
    },
    onMutate: async (pickId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.reactions(pickId),
      });

      // Snapshot previous value
      const previousReactions = queryClient.getQueryData<ReactionData>(
        queryKeys.reactions(pickId)
      );

      // Optimistically update
      if (previousReactions) {
        queryClient.setQueryData<ReactionData>(
          queryKeys.reactions(pickId),
          {
            isLiked: true,
            totalItems: previousReactions.totalItems + 1,
          }
        );
      }

      return { previousReactions };
    },
    onSuccess: (data, pickId) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.reactions(pickId),
      });
    },
    onError: (error, pickId, context) => {
      // Rollback optimistic update
      if (context?.previousReactions) {
        queryClient.setQueryData<ReactionData>(
          queryKeys.reactions(pickId),
          context.previousReactions
        );
      }
    },
  });
}

/**
 * Remove reaction mutation
 */
export function useRemoveReaction() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (pickId: string) => {
      return await removeReaction(pickId);
    },
    onMutate: async (pickId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.reactions(pickId),
      });

      // Snapshot previous value
      const previousReactions = queryClient.getQueryData<ReactionData>(
        queryKeys.reactions(pickId)
      );

      // Optimistically update
      if (previousReactions) {
        queryClient.setQueryData<ReactionData>(
          queryKeys.reactions(pickId),
          {
            isLiked: false,
            totalItems: Math.max(0, previousReactions.totalItems - 1),
          }
        );
      }

      return { previousReactions };
    },
    onSuccess: (data, pickId) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.reactions(pickId),
      });
    },
    onError: (error, pickId, context) => {
      // Rollback optimistic update
      if (context?.previousReactions) {
        queryClient.setQueryData<ReactionData>(
          queryKeys.reactions(pickId),
          context.previousReactions
        );
      }
    },
  });
}

