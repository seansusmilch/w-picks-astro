import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { createReaction, deleteReaction, getReactions } from '@/lib/reactions';
import { ActionError } from 'astro:actions';
import { getLogger } from '@/lib/logger';

const logger = getLogger('actions:reactions');

export const reactions = {
  addReaction: defineAction({
    accept: 'json',
    input: z.object({
      pickId: z.string(),
    }),
    async handler({ pickId }, { locals }) {
      const { user } = locals;
      if (!user?.record?.id) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'User not logged in',
        });
      }

      try {
        const reaction = await createReaction({
          user: user.record.id,
          pick: pickId,
        });

        return reaction;
      } catch (error) {
        logger.error({ error, pickId }, 'Error in createReaction action');
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create reaction',
        });
      }
    },
  }),

  removeReaction: defineAction({
    accept: 'json',
    input: z.object({
      pickId: z.string(),
    }),
    async handler({ pickId }, { locals }) {
      const { user } = locals;
      if (!user?.record?.id) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'User not logged in',
        });
      }

      try {
        await deleteReaction({
          user: user.record.id,
          pick: pickId,
        });
      } catch (error) {
        logger.error({ error, pickId }, 'Error in removeReaction action');
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove reaction',
        });
      }
    },
  }),

  getReactions: defineAction({
    accept: 'json',
    input: z.object({
      pickId: z.string().length(15),
    }),
    async handler({ pickId }, { locals }) {
      const { user } = locals;
      if (!user?.record?.id) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'User not logged in',
        });
      }

      try {
        const reactions = await getReactions({
          pick: pickId,
          user: user.record.id,
        });
        return reactions;
      } catch (error) {
        logger.error({ error, pickId }, 'Error in getReactions action');
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get reactions',
        });
      }
    },
  }),
};
