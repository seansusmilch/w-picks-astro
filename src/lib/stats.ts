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
