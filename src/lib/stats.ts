import { getPB } from '@/lib/data';
import { StatZ } from '@/lib/definitions';

export function validateStats(stats: any) {
  const statsResult = StatZ.safeParse(stats);
  if (!statsResult.success) {
    console.error('Failed to parse stats:', statsResult.error);
    throw new Error('Failed to parse stats');
  }
  return statsResult.data;
}

export async function getStatsByUserId(userId: string) {
  const pb = getPB();
  const stats = await pb
    .collection('stats')
    .getFirstListItem(`user="${userId}"`);

  if (!stats) return null;

  return validateStats(stats);
}

export async function getAllStats() {
  const pb = getPB();
  const sortedBy = 'win_pick_rate';

  const userStats = await pb.collection('stats').getList(1, 50, {
    sort: `-${sortedBy}`,
    expand: 'user',
    filter: 'user.verified = true',
    fields: '*,expand.user.id,expand.user.avatar,expand.user.username',
  });

  return userStats.items;
}
