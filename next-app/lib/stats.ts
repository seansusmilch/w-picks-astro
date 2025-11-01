import { initPocketBase, getAdminPocketBase } from './pocketbase-server';
import { StatZ, WeeklyStatZ, type StatType, type WeeklyStatType, type UserType } from './definitions';
import type { RecordModel } from 'pocketbase';

const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';

export function getUserAvatarUrl(userId: string, filename: string): string | null {
  if (!filename || !userId) return null;
  return new URL(`/api/files/users/${userId}/${filename}`, POCKETBASE_URL).toString();
}

/**
 * Expand avatar URLs for stats with user expansion
 */
export function expandAvatarUrls<T extends RecordModel & { expand?: { user?: UserType } }>(
  items: T[]
): T[] {
  return items.map((item) => {
    if (item.expand?.user) {
      item.expand.user.avatar_url = getUserAvatarUrl(
        item.expand.user.id,
        item.expand.user.avatar
      ) || undefined;
    }
    return item;
  });
}

export async function getStatsByUserId(userId: string): Promise<StatType | null> {
  const pb = await initPocketBase();
  
  try {
    const stats = await pb
      .collection('stats')
      .getFirstListItem(`user="${userId}"`);

    if (!stats) return null;

    const parsedStats = StatZ.safeParse(stats);
    if (!parsedStats.success) {
      console.error('Stats validation failed', parsedStats.error);
      return null;
    }

    return parsedStats.data;
  } catch (error) {
    // If stats don't exist, return null instead of throwing
    if (error instanceof Error && error.message.includes('not found')) {
      return null;
    }
    console.error('Failed to fetch stats', error);
    return null;
  }
}

/**
 * Get all-time stats for all verified users, sorted by win_pick_rate
 */
export async function getAllStats() {
  const pb = await getAdminPocketBase();
  const sortedBy = 'win_pick_rate';

  const userStats = await pb.collection('stats').getFullList({
    sort: `-${sortedBy}`,
    expand: 'user',
    filter: 'user.verified = true',
    fields: '*,expand.user.id,expand.user.avatar,expand.user.username',
  });

  return expandAvatarUrls(userStats);
}

/**
 * Get weekly stats for a specific week
 */
export async function getWeeklyStats(week: string) {
  const pb = await getAdminPocketBase();

  const weekStats = await pb.collection('weekly_stats').getFullList({
    filter: pb.filter('year_week = {:week}', { week }),
    expand: 'user',
    sort: '-win_pick_rate',
  });

  return expandAvatarUrls(weekStats);
}

/**
 * Get list of available weeks (sorted by most recent first)
 */
export async function getWeekList(): Promise<string[]> {
  const pb = await getAdminPocketBase();
  const weekList = await pb.collection('weekly_stats').getFullList({
    sort: '-year_week',
    fields: 'year_week',
  });
  return Array.from(new Set(weekList.map((week) => week.year_week)));
}

