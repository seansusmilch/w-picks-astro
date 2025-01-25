import { getPB } from '@/lib/data';
import { ScoreboardZ } from '@/lib/definitions';

export async function getScoreboardByCode(code: string) {
  const pb = getPB();
  const scoreboardRecord = await pb
    .collection('scoreboards')
    .getFirstListItem(pb.filter(`code = {:code}`, { code }))
    .catch(() => null);

  if (!scoreboardRecord) return null;

  const scoreboard = ScoreboardZ.safeParse(scoreboardRecord);
  if (!scoreboard.success) {
    console.error('Failed to parse scoreboard:', scoreboard.error);
    return null;
  }

  return scoreboard.data;
}
