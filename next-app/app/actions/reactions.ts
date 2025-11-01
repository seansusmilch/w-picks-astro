'use server';

import { getAdminPocketBase, initPocketBase } from '@/lib/pocketbase-server';
import { ReactionZ, type ReactionType } from '@/lib/definitions';
import { ClientResponseError } from 'pocketbase';
import { getLogger } from '@/lib/logger';

const logger = getLogger('reactions');

export interface ReactionData {
  isLiked: boolean;
  totalItems: number;
}

/**
 * Get reactions for a specific pick.
 * Returns the total count and whether the current user has liked it.
 */
export async function getReactions(pickId: string): Promise<ReactionData> {
  logger.debug({ pickId }, 'Getting reactions for pick');

  // Use regular instance to get current user ID
  const userPb = await initPocketBase();
  const userId = userPb.authStore.record?.id;
  
  if (!userId) {
    logger.warn({ pickId }, 'User not authenticated');
    throw new Error('User must be authenticated to get reactions');
  }

  // Use admin instance for fetching reactions (like Astro does)
  const pb = await getAdminPocketBase();

  try {
    // Get total reactions count
    const allReactions = await pb.collection('reactions').getList(1, 1, {
      filter: `pick = "${pickId}"`,
    });
    const totalItems = allReactions.totalItems;

    // Check if current user has liked this pick
    let isLiked = false;
    try {
      await pb
        .collection('reactions')
        .getFirstListItem(`user = "${userId}" && pick = "${pickId}"`);
      isLiked = true;
    } catch (error) {
      if (error instanceof ClientResponseError && error.status === 404) {
        isLiked = false;
      } else {
        logger.error({ error, userId, pickId }, 'Error checking if user liked pick');
        throw error;
      }
    }

    return {
      totalItems,
      isLiked,
    };
  } catch (error) {
    logger.error(
      {
        pickId,
        userId,
        error: error instanceof Error ? error.message : String(error),
      },
      'Failed to get reactions'
    );
    throw error;
  }
}

/**
 * Add a reaction (like) to a pick.
 */
export async function addReaction(pickId: string): Promise<void> {
  logger.debug({ pickId }, 'Adding reaction to pick');

  // Use regular instance to get current user ID
  const userPb = await initPocketBase();
  const userId = userPb.authStore.record?.id;

  if (!userId) {
    logger.warn({ pickId }, 'User not authenticated');
    throw new Error('User must be authenticated to add reactions');
  }

  // Use admin instance for creating reactions (like Astro does)
  const pb = await getAdminPocketBase();

  const reactionData: ReactionType = {
    user: userId,
    pick: pickId,
  };

  const { success, data, error } = ReactionZ.safeParse(reactionData);
  if (!success) {
    logger.error(
      { pickId, userId, validationErrors: error.issues },
      'Failed to validate reaction data'
    );
    throw new Error(
      `Failed to parse reaction data: ${JSON.stringify(error.issues, null, 2)}`
    );
  }

  try {
    await pb.collection('reactions').create({
      user: data.user,
      pick: data.pick,
    });
    logger.debug({ pickId, userId }, 'Successfully added reaction');
  } catch (error) {
    logger.error(
      {
        pickId,
        userId,
        error: error instanceof Error ? error.message : String(error),
      },
      'Failed to add reaction'
    );
    throw error;
  }
}

/**
 * Remove a reaction (unlike) from a pick.
 */
export async function removeReaction(pickId: string): Promise<void> {
  logger.debug({ pickId }, 'Removing reaction from pick');

  // Use regular instance to get current user ID
  const userPb = await initPocketBase();
  const userId = userPb.authStore.record?.id;

  if (!userId) {
    logger.warn({ pickId }, 'User not authenticated');
    throw new Error('User must be authenticated to remove reactions');
  }

  // Use admin instance for deleting reactions (like Astro does)
  const pb = await getAdminPocketBase();

  try {
    const existingReaction = await pb
      .collection('reactions')
      .getFirstListItem(`user = "${userId}" && pick = "${pickId}"`);

    await pb.collection('reactions').delete(existingReaction.id);
    logger.debug({ pickId, userId }, 'Successfully removed reaction');
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 404) {
      logger.debug({ pickId, userId }, 'Reaction not found (already removed)');
      return;
    }
    logger.error(
      {
        pickId,
        userId,
        error: error instanceof Error ? error.message : String(error),
      },
      'Failed to remove reaction'
    );
    throw error;
  }
}

