import { PickZ, type PickType } from '@/lib/definitions';
import { getAPB, getPB, getUser } from '@/lib/data';
import { getMatchupByCode, isMatchupUpcoming } from '@/lib/matchups';

export function validatePick(pick: any) {
  const pickResult = PickZ.safeParse(pick);
  if (!pickResult.success) {
    console.error('Failed to parse pick:', pickResult.error);
    throw new Error('Failed to parse pick');
  }
  return pickResult.data;
}

async function checkUserPermission(pickId: string, matchupId: string) {
  console.log('checkUserPermission', pickId, matchupId);
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
      pickResponse = await pb.collection('picks').update(pick.id, pick);
    } else {
      delete pick.id;
      pick.user = user.record.id;
      pickResponse = await pb
        .collection('picks')
        .create({ ...pick, status: 'upcoming' });
    }

    const newPick = PickZ.safeParse(pickResponse);
    if (!newPick.success) {
      console.error('Failed to save pick:', newPick.error);
      throw new Error('Failed to save pick');
    }
    return newPick.data;
  } catch (e) {
    console.error('Error saving pick:', e);
    throw new Error('Failed to save pick');
  }
}

export async function deletePick(pickId: string, matchupId: string) {
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
    console.error('Failed to parse pick:', pick.error);
    throw new Error('Failed to parse pick');
  }

  return pick.data;
}

export async function getPicksByMatchupId(matchupId: string) {
  const pb = getPB();
  const picks = await pb.collection('picks').getFullList({
    filter: pb.filter('matchup = {:matchupId}', { matchupId }),
    expand: 'user',
    fields: '*,expand.user.id,expand.user.avatar,expand.user.username',
  });
  return picks;
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
      await pb.collection('picks').update(pick.id, {
        status: status,
      });
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
