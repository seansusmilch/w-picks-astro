import { getPB, getAPB } from '@/lib/data';
import { MatchupZ } from '@/lib/definitions';
import { getCodePrefixFromDate } from './data_common';

export function validateMatchup(matchup: any) {
  const matchupResult = MatchupZ.safeParse(matchup);
  if (!matchupResult.success) {
    console.error(
      'Failed to parse matchup:',
      JSON.stringify(matchupResult.error.issues)
    );
    throw new Error('Failed to parse matchup');
  }
  return matchupResult.data;
}

export async function getMatchupById(id: string) {
  const pb = getPB();
  const matchupRecord = await pb
    .collection('matchups')
    .getOne(id)
    .catch(() => null);

  if (!matchupRecord) return null;

  return validateMatchup(matchupRecord);
}

export async function getMatchupByCode(code: string) {
  const pb = getAPB();
  const matchupRecord = await pb
    .collection('matchups')
    .getFirstListItem(pb.filter('code = {:code}', { code }))
    .catch(() => null);

  if (!matchupRecord) return null;

  return validateMatchup(matchupRecord);
}

export async function isMatchupUpcoming(id: string) {
  const matchup = await getMatchupById(id);
  if (!matchup) return false;
  const now = Date.now();
  const matchupTime = Date.parse(matchup.time_utc);
  return matchupTime > now;
}

export async function getTodayMatchups() {
  const pb = getAPB();
  const codePrefix = getCodePrefixFromDate(new Date());

  const response = await pb.collection('matchups').getList(1, 100, {
    filter: pb.filter(`code ?~ {:codePrefix}`, { codePrefix }),
  });

  return response.items;
}
