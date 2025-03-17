import { ClientResponseError } from 'pocketbase';
import { ReactionZ, type ReactionType } from './definitions';
import { getAPB, getPB } from '@/lib/data';

export async function createReaction(reaction: ReactionType) {
  const { success, data, error } = ReactionZ.safeParse(reaction);
  if (!success) {
    throw new Error(
      `Failed to parse reaction data: ${JSON.stringify(error, null, 2)}`
    );
  }

  const pb = await getAPB();
  const userId = data.user;
  const pickId = data.pick;
  console.log('createReaction', { userId, pickId });

  try {
    const newReaction = await pb.collection('reactions').create({
      user: userId,
      pick: pickId,
    });
    return newReaction;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Error creating reaction:', error);
    throw new Error('Failed to create reaction');
  }
}

export async function deleteReaction(reaction: ReactionType) {
  const { success, data, error } = ReactionZ.safeParse(reaction);
  if (!success) {
    throw new Error(
      `Failed to parse reaction data: ${JSON.stringify(error, null, 2)}`
    );
  }

  const pb = await getAPB();
  const userId = data.user;
  const pickId = data.pick;

  try {
    const existingReaction = await pb
      .collection('reactions')
      .getFirstListItem(
        pb.filter(`user = {:userId} && pick = {:pickId}`, { userId, pickId })
      );

    if (!existingReaction) {
      throw new Error(
        `Reaction not found for user ${userId} and pick ${pickId}`
      );
    }

    await pb.collection('reactions').delete(existingReaction.id);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Error deleting reaction:', error);
    throw new Error('Failed to delete reaction');
  }
}

export async function getReactions({
  pick,
  user,
}: {
  pick: string;
  user: string;
}) {
  const pb = await getAPB();

  const allReactions = await pb.collection('reactions').getList(1, 1, {
    filter: pb.filter('pick = {:pick}', { pick }),
  });
  const totalItems = allReactions.totalItems;

  let isLiked = false;
  if (user) {
    try {
      const reaction = await pb
        .collection('reactions')
        .getFirstListItem(
          pb.filter('user = {:user} && pick = {:pick}', { user, pick })
        );
      isLiked = !!reaction;
    } catch (error) {
      if (error instanceof ClientResponseError && error.status === 404) {
        isLiked = false;
      } else {
        console.error('Error getting reaction:', error);
      }
    }
  }

  return {
    totalItems,
    isLiked,
  };
}
