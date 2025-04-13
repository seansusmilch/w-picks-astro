import { PickZ, type PickType, type ScoreboardType } from '@/lib/definitions';
import { getAPB, getPB, getUser } from '@/lib/data';
import {
  getMatchupByCode,
  getWinningTeamByMatchupId,
  isMatchupUpcoming,
} from '@/lib/matchups';
import { getProfilesByIds } from './users';
import { getLogger } from '@/lib/logger';

// Create a named logger for this file
const logger = getLogger('picks');

export function validatePick(pick: any) {
  const pickResult = PickZ.safeParse(pick);
  if (!pickResult.success) {
    logger.error({ error: pickResult.error }, 'Failed to parse pick');
    throw new Error('Failed to parse pick');
  }
  return pickResult.data;
}

async function checkUserPermission(pickId: string, matchupId: string) {
  logger.debug({ pickId, matchupId }, 'Checking user permission');
  const pb = getPB();
  if (!pb.authStore.isValid) {
    throw new Error('User not authenticated');
  }

  if (!(await isMatchupUpcoming(matchupId))) {
    throw new Error('Cannot create/modify a pick for a past match');
  }

  const user = await getUser();
  const pick = await getPickById(pickId);
  if (!pick) return;

  if (user.record.id !== pick.user) {
    throw new Error('User does not have permission to update this pick');
  }
}

export async function upsertPick(pick: PickType) {
  await checkUserPermission(pick.id, pick.matchup);
  const pb = getPB();
  const user = await getUser();

  if (pick.win_prediction === 'indeterminate') {
    throw new Error(
      'Cannot create/update a pick with an indeterminate prediction. Please report this to the developer.'
    );
  }

  try {
    const exists = await getPickById(pick.id);
    let pickResponse;
    if (exists) {
      logger.debug({ pickId: pick.id }, 'Updating existing pick');
      pickResponse = await pb.collection('picks').update(pick.id, pick);
    } else {
      logger.debug({ matchupId: pick.matchup }, 'Creating new pick');
      delete pick.id;
      pick.user = user.record.id;
      pickResponse = await pb
        .collection('picks')
        .create({ ...pick, status: 'upcoming' });
    }

    const newPick = PickZ.safeParse(pickResponse);
    if (!newPick.success) {
      logger.error({ error: newPick.error }, 'Failed to save pick');
      throw new Error('Failed to save pick');
    }
    return newPick.data;
  } catch (e) {
    logger.error({ error: e }, 'Error saving pick');
    throw new Error('Failed to save pick');
  }
}

export async function deletePick(pickId: string, matchupId: string) {
  logger.debug({ pickId, matchupId }, 'Deleting pick');
  await checkUserPermission(pickId, matchupId);
  const pb = getPB();
  return await pb.collection('picks').delete(pickId);
}

export async function getPickById(id: string) {
  if (!id) return null;
  const pb = getPB();

  const pickRecord = await pb
    .collection('picks')
    .getOne(id)
    .catch(() => null);

  if (!pickRecord) return null;

  const pick = PickZ.safeParse(pickRecord);
  if (!pick.success) {
    logger.error({ error: pick.error }, 'Failed to parse pick');
    throw new Error('Failed to parse pick');
  }

  return pick.data;
}

export async function getPicksByMatchupId(matchupId: string) {
  const pb = getAPB();
  const picks = await pb.collection('picks').getFullList({
    filter: pb.filter('matchup = {:matchupId}', { matchupId }),
    expand: 'user',
    fields: '*,expand.user.id,expand.user.avatar,expand.user.username',
  });
  return picks;
}

export async function isWinningPick(pick: PickType) {
  const winningTeam = await getWinningTeamByMatchupId(pick.matchup);
  if (!winningTeam) {
    throw new Error('No winning team found when checking if pick is winning');
  }

  return pick.win_prediction === winningTeam;
}

export async function updatePicksStatusByMatchupId(
  matchupId: string,
  status: 'upcoming' | 'live' | 'past'
) {
  const picks = await getPicksByMatchupId(matchupId);
  if (!picks) return;
  const pb = getAPB();

  await Promise.all(
    picks.map(async (pick) => {
      let newData;
      if (status === 'past') {
        newData = {
          status: status,
          result: (await isWinningPick(pick)) ? 'W' : 'L',
        };
      } else {
        newData = {
          status: status,
        };
      }
      await pb.collection('picks').update(pick.id, newData);
    })
  );
}

export async function updatePicksStatusByCode(
  code: string,
  status: 'upcoming' | 'live' | 'past'
) {
  const matchup = await getMatchupByCode(code);
  if (!matchup) return;

  await updatePicksStatusByMatchupId(matchup.id, status);
}

export async function getPicksByUser(
  userId: string,
  status?: 'upcoming' | 'live' | 'past'
) {
  const pb = getPB();

  let filter = pb.filter('user = {:userId}', { userId });
  if (status) {
    filter = pb.filter('user = {:userId} && status = {:status}', {
      userId,
      status,
    });
  }

  const picks = await pb.collection('picks').getFullList({
    sort: '-matchup.time_utc',
    filter: filter,
    expand: 'matchup',
  });
  return picks;
}

export async function getLatestPicks(limit: number = 10, userId?: string) {
  const pb = getAPB();

  try {
    const picks = await pb.collection('picks').getList(1, limit, {
      sort: '-updated',
      filter: userId ? pb.filter('user != {:userId}', { userId }) : undefined,
      expand: 'matchup',
    });

    const users = await getProfilesByIds(picks.items.map((pick) => pick.user));

    return {
      picks: picks.items,
      users,
    };
  } catch (error) {
    logger.error({ error }, 'Error fetching latest picks');
    return {
      picks: [],
      users: [],
    };
  }
}

export async function updatePicksStatus(scoreboard: ScoreboardType) {
  logger.info(
    { code: scoreboard.code, status: scoreboard.status },
    'Updating picks status'
  );
  switch (scoreboard.status) {
    case 1:
      await updatePicksStatusByCode(scoreboard.code, 'upcoming');
      break;
    case 2:
      await updatePicksStatusByCode(scoreboard.code, 'live');
      break;
    case 3:
      await updatePicksStatusByCode(scoreboard.code, 'past');
      break;
    default:
      logger.warn(
        { code: scoreboard.code, status: scoreboard.status },
        'Unknown scoreboard status'
      );
      break;
  }
}
