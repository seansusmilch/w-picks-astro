'use server';

import { z } from 'zod';
import { createReaction, deleteReaction, getReactions } from '@/lib/reactions';
import { getLogger } from '@/lib/logger';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/data';

const logger = getLogger('actions:reactions');

const addReactionSchema = z.object({
  pickId: z.string(),
});

export async function addReaction(data: z.infer<typeof addReactionSchema>) {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');
  
  if (!pbAuth) {
    throw new Error('User not logged in');
  }

  const user = await getUser(pbAuth.value);
  if (!user?.record?.id) {
    throw new Error('User not logged in');
  }

  try {
    const reaction = await createReaction({
      user: user.record.id,
      pick: data.pickId,
    });

    return reaction;
  } catch (error) {
    logger.error({ error, pickId: data.pickId }, 'Error in createReaction action');
    throw new Error('Failed to create reaction');
  }
}

const removeReactionSchema = z.object({
  pickId: z.string(),
});

export async function removeReaction(data: z.infer<typeof removeReactionSchema>) {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');
  
  if (!pbAuth) {
    throw new Error('User not logged in');
  }

  const user = await getUser(pbAuth.value);
  if (!user?.record?.id) {
    throw new Error('User not logged in');
  }

  try {
    await deleteReaction({
      user: user.record.id,
      pick: data.pickId,
    });
  } catch (error) {
    logger.error({ error, pickId: data.pickId }, 'Error in removeReaction action');
    throw new Error('Failed to remove reaction');
  }
}

const getReactionsSchema = z.object({
  pickId: z.string().length(15),
});

export async function getReactionsAction(data: z.infer<typeof getReactionsSchema>) {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');
  
  if (!pbAuth) {
    throw new Error('User not logged in');
  }

  const user = await getUser(pbAuth.value);
  if (!user?.record?.id) {
    throw new Error('User not logged in');
  }

  try {
    const reactions = await getReactions({
      pick: data.pickId,
      user: user.record.id,
    });
    return reactions;
  } catch (error) {
    logger.error({ error, pickId: data.pickId }, 'Error in getReactions action');
    throw new Error('Failed to get reactions');
  }
}