import { initPocketBase } from './pocketbase-server';
import { StatZ, type StatType } from './definitions';

const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';

export function getUserAvatarUrl(userId: string, filename: string): string | null {
  if (!filename || !userId) return null;
  return new URL(`/api/files/users/${userId}/${filename}`, POCKETBASE_URL).toString();
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

