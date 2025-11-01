import { getAdminPocketBase } from '@/lib/pocketbase-server';
import { UserZ, PickZ, type UserType, type PickType } from '@/lib/definitions';

/**
 * Fetch a user record by username using an admin PocketBase instance.
 */
export async function getUserByUsername(username: string): Promise<UserType | null> {
  const pb = await getAdminPocketBase();

  try {
    const userRecord = await pb
      .collection('users')
      .getFirstListItem(`username = "${username}"`)
      .catch(() => null);

    if (!userRecord) return null;

    const parsed = UserZ.safeParse(userRecord);
    if (!parsed.success) {
      console.error('getUserByUsername: user validation failed', parsed.error);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error('getUserByUsername: failed to fetch user', error);
    return null;
  }
}

/**
 * Fetch picks for a user. Expands matchup by default to power the pick table.
 */
export async function getPicksByUser(userId: string): Promise<PickType[]> {
  const pb = await getAdminPocketBase();

  try {
    const picksRecords = await pb.collection('picks').getFullList({
      sort: '-matchup.time_utc',
      filter: `user = "${userId}"`,
      expand: 'matchup',
    });

    const picks: PickType[] = [];
    for (const rec of picksRecords) {
      const parsed = PickZ.safeParse(rec);
      if (parsed.success) {
        picks.push(parsed.data);
      } else {
        console.warn('getPicksByUser: pick validation failed', {
          pickId: rec.id,
          issues: parsed.error.issues,
        });
      }
    }

    return picks;
  } catch (error) {
    console.error('getPicksByUser: failed to fetch picks', error);
    return [];
  }
}


