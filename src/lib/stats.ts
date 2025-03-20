import { getAPB, getPB } from '@/lib/data';
import { StatZ } from '@/lib/definitions';
import { getLogger } from '@/lib/logger';

const logger = getLogger('stats');

export function validateStats(stats: any) {
  const statsResult = StatZ.safeParse(stats);
  if (!statsResult.success) {
    logger.error({ error: statsResult.error }, 'Failed to parse stats');
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
  const pb = getAPB();
  const sortedBy = 'win_pick_rate';

  const userStats = await pb.collection('stats').getFullList({
    sort: `-${sortedBy}`,
    expand: 'user',
    filter: 'user.verified = true',
    fields: '*,expand.user.id,expand.user.avatar,expand.user.username',
  });

  return userStats;
}

export async function getWeeklyStats(week: string) {
  const pb = getAPB();

  const weekStats = await pb.collection('weekly_stats').getFullList({
    filter: pb.filter('year_week = {:week}', { week }),
    expand: 'user',
  });

  return weekStats;
}

export async function getWeekList() {
  const pb = getAPB();
  const weekList = await pb.collection('weekly_stats').getFullList({
    sort: '-year_week',
    fields: 'year_week',
  });
  return Array.from(new Set(weekList.map((week) => week.year_week)));
}
