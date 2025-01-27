import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { deletePick, upsertPick } from '@/lib/picks';
import { PostHogClient } from '@/lib/posthog';
import { POSTHOG_API_TOKEN } from 'astro:env/server';

export const server = {
  submitPick: defineAction({
    accept: 'form',
    input: z.object({
      id: z.string().length(15).optional(),
      win_prediction: z.string().length(3),
      comment: z.string().optional(),
      matchup: z.string().length(15),
    }),
    async handler(pick) {
      console.log('submitPick', pick);
      return await upsertPick(pick);
    },
  }),
  deletePick: defineAction({
    accept: 'form',
    input: z.object({
      id: z
        .string({ message: 'You dont have a pick for this matchup' })
        .length(15),
      matchup: z.string().length(15),
    }),
    async handler({ id, matchup }) {
      console.log('deletePick', id, matchup);
      return await deletePick(id, matchup);
    },
  }),
  isFeatureEnabled: defineAction({
    accept: 'json',
    input: z.object({
      feature: z.string(),
    }),
    async handler({ feature }, { cookies }) {
      const cookie = cookies.get(`ph_${POSTHOG_API_TOKEN}_posthog`);
      const distinctId = cookie?.json().distinct_id;
      if (!distinctId) {
        return crypto.randomUUID();
      }
      const posthogClient = PostHogClient();
      return await posthogClient.isFeatureEnabled(feature, distinctId);
    },
  }),
};
