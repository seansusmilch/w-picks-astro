import { getPB } from '@/lib/data';
import { MatchupZ } from '@/lib/definitions';

export async function getMatchupById(id: string) {
  const pb = getPB();
  const matchupRecord = await pb
    .collection('matchups')
    .getOne(id)
    .catch(() => null);

  if (!matchupRecord) return null;

  const matchup = MatchupZ.safeParse(matchupRecord);
  if (!matchup.success) {
    console.error('Failed to parse matchup:', matchup.error);
    throw new Error('Failed to parse matchup');
  }

  return matchup.data;
}

export async function isMatchupUpcoming(id: string) {
  const matchup = await getMatchupById(id);
  if (!matchup) return false;
  const now = Date.now();
  const matchupTime = Date.parse(matchup.time_utc);
  return matchupTime > now;
}

export async function getTodayMatchups() {
  const pb = getPB();
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const response = await pb.collection('matchups').getList(1, 1, {
    filter: `time_utc >= "${today.toISOString()}" && time_utc <= "${tomorrow.toISOString()}"`,
  });

  return response.items;
}
