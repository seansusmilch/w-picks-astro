'use server';

import { z } from 'zod';
import { getAuthenticatedUser, getAdminPocketBase, initPocketBase } from '@/lib/pocketbase-server';
import { PickZ, type PickType } from '@/lib/definitions';
import { getLogger } from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getProfilesByIds, type UserProfile } from '@/lib/users';

const logger = getLogger('picks');

const submitPickSchema = z.object({
  id: z.string().length(15).optional(),
  win_prediction: z.string().length(3),
  comment: z.string().optional(),
  matchup: z.string().length(15),
});

const deletePickSchema = z.object({
  id: z.string().length(15),
  matchup: z.string().length(15),
});

export type SubmitPickFormState = {
  error?: string;
  success?: boolean;
  pick?: PickType;
};

export type DeletePickFormState = {
  error?: string;
  success?: boolean;
};

async function checkUserPermission(
  pickId: string | undefined,
  matchupId: string,
  userId: string
): Promise<void> {
  logger.debug({ pickId, matchupId }, 'Checking user permission');

  // If updating an existing pick, verify ownership
  if (pickId) {
    const pb = await initPocketBase();
    const pickRecord = await pb
      .collection('picks')
      .getOne(pickId)
      .catch(() => null);

    if (pickRecord && pickRecord.user !== userId) {
      throw new Error('User does not have permission to update this pick');
    }
  }
}

export async function submitPickAction(
  prevState: SubmitPickFormState | undefined,
  formData: FormData
): Promise<SubmitPickFormState> {
  const startTime = Date.now();
  logger.info({}, 'Submitting pick');

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        error: 'You must be logged in to submit a pick',
      };
    }

    const idValue = formData.get('id')?.toString();
    const formDataValues = {
      id: idValue && idValue.length > 0 ? idValue : undefined,
      win_prediction: formData.get('win_prediction')?.toString(),
      comment: formData.get('comment')?.toString() || '',
      matchup: formData.get('matchup')?.toString(),
    };

    logger.debug({ formDataValues }, 'Form data received');

    const result = submitPickSchema.safeParse(formDataValues);

    if (!result.success) {
      logger.warn(
        {
          issues: result.error.issues,
        },
        'Pick submission validation failed'
      );
      return {
        error: result.error.issues[0]?.message || 'Invalid input',
      };
    }

    const { id, win_prediction, comment, matchup } = result.data;

    // Don't allow indeterminate picks to be submitted
    if (win_prediction === 'indeterminate') {
      return {
        error:
          'Cannot create/update a pick with an indeterminate prediction. Please select a team or delete your pick.',
      };
    }

    // Check permissions
    await checkUserPermission(id, matchup, user.record.id);

    // Verify matchup exists and check if game has started
    // Note: matchup is an ID, not a code, so we need to fetch it differently
    const pb = await initPocketBase();
    const matchupRecord = await pb
      .collection('matchups')
      .getOne(matchup)
      .catch(() => null);

    if (!matchupRecord) {
      return {
        error: 'Matchup not found',
      };
    }

    // Check if game has started - we'll check scoreboard status
    // Scoreboard status >= 2 means game has started (live or finished)
    const scoreboardRecord = matchupRecord.scoreboard
      ? await pb
          .collection('scoreboards')
          .getOne(matchupRecord.scoreboard)
          .catch(() => null)
      : null;

    if (scoreboardRecord && scoreboardRecord.status >= 2) {
      return {
        error: 'Cannot create/update a pick for a game that has already started',
      };
    }

    let pickResponse;

    if (id) {
      // Update existing pick
      logger.debug({ pickId: id }, 'Updating existing pick');
      pickResponse = await pb.collection('picks').update(id, {
        win_prediction,
        comment: comment || '',
      });
    } else {
      // Create new pick
      logger.debug({ matchupId: matchup }, 'Creating new pick');
      pickResponse = await pb.collection('picks').create({
        win_prediction,
        comment: comment || '',
        matchup,
        user: user.record.id,
        status: 'upcoming',
      });
    }

    const parsedPick = PickZ.safeParse(pickResponse);
    if (!parsedPick.success) {
      logger.error({ error: parsedPick.error }, 'Failed to parse pick response');
      return {
        error: 'Failed to save pick',
      };
    }

    // Revalidate the matchup page
    // We need to revalidate all matchup pages since we don't have the specific code
    revalidatePath('/matchup', 'page');

    logger.info(
      {
        pickId: parsedPick.data.id,
        matchupId: matchup,
        duration: Date.now() - startTime,
      },
      'Pick submitted successfully'
    );

    return {
      success: true,
      pick: parsedPick.data,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        duration,
      },
      'Failed to submit pick'
    );

    return {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to submit pick. Please try again.',
    };
  }
}

export async function deletePickAction(
  prevState: DeletePickFormState | undefined,
  formData: FormData
): Promise<DeletePickFormState> {
  const startTime = Date.now();
  logger.info({}, 'Deleting pick');

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        error: 'You must be logged in to delete a pick',
      };
    }

    const result = deletePickSchema.safeParse({
      id: formData.get('id')?.toString(),
      matchup: formData.get('matchup')?.toString(),
    });

    if (!result.success) {
      logger.warn(
        {
          issues: result.error.issues,
        },
        'Pick deletion validation failed'
      );
      return {
        error: result.error.issues[0]?.message || 'Invalid input',
      };
    }

    const { id, matchup } = result.data;

    // Check permissions
    await checkUserPermission(id, matchup, user.record.id);

    const pb = await initPocketBase();
    await pb.collection('picks').delete(id);

    // Revalidate the matchup page
    // We need to revalidate all matchup pages since we don't have the specific code
    revalidatePath('/matchup', 'page');

    logger.info(
      {
        pickId: id,
        matchupId: matchup,
        duration: Date.now() - startTime,
      },
      'Pick deleted successfully'
    );

    return {
      success: true,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        duration,
      },
      'Failed to delete pick'
    );

    return {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to delete pick. Please try again.',
    };
  }
}

export async function getLatestPicks(
  limit: number = 10,
  userId?: string
): Promise<{ picks: PickType[]; users: UserProfile[] }> {
  try {
    const pb = await getAdminPocketBase();

    // Check if the logged-in user has opted to hide themselves — if not, include their picks
    let excludeSelf = false;
    if (userId) {
      const [selfProfile] = await getProfilesByIds([userId]);
      excludeSelf = selfProfile?.hideFromLatestPicks ?? false;
    }

    const picksResult = await pb.collection('picks').getList(1, limit, {
      sort: '-created',
      filter: userId && excludeSelf ? `user != "${userId}"` : undefined,
      expand: 'matchup',
    });

    const validPicks: PickType[] = [];
    for (const item of picksResult.items) {
      const parsed = PickZ.safeParse(item);
      if (parsed.success) {
        validPicks.push(parsed.data);
      }
    }

    const allUsers = await getProfilesByIds(validPicks.map((p) => p.user));
    const hiddenUserIds = new Set(
      allUsers
        .filter((u) => u.hideFromLatestPicks)
        .map((u) => u.id)
    );
    const filteredPicks = validPicks.filter((p) => !hiddenUserIds.has(p.user));
    const visibleUsers = allUsers.filter(
      (u) => !hiddenUserIds.has(u.id) || filteredPicks.some((p) => p.user === u.id)
    ).filter((u) => filteredPicks.some((p) => p.user === u.id));

    return { picks: filteredPicks, users: visibleUsers };
  } catch {
    return { picks: [], users: [] };
  }
}

