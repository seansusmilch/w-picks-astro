import { upsertPick } from '@/lib/picks';
import { deletePick } from '@/lib/picks';
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { getLogger } from '@/lib/logger';

const logger = getLogger('actions:picks');

export const picks = {
  submitPick: defineAction({
    accept: 'form',
    input: z.object({
      id: z.string().length(15).optional(),
      win_prediction: z.string().length(3),
      comment: z.string().optional(),
      matchup: z.string().length(15),
    }),
    async handler(pick) {
      logger.info({ pick }, 'submitPick');
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
      logger.info({ id, matchup }, 'deletePick');
      return await deletePick(id, matchup);
    },
  }),
};
