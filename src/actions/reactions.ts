import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { createReaction, deleteReaction, getReactions } from '@/lib/reactions';
import { ActionError } from 'astro:actions';

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
        console.error('Error in createReaction action:', error);
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
        console.error('Error in removeReaction action:', error);
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
        const reactions = await getReactions(pickId);
        return reactions;
      } catch (error) {
        console.error('Error in getReactions action:', error);
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get reactions',
        });
      }
    },
  }),
};
