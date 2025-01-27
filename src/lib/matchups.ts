import { getPB, getAPB } from '@/lib/data';
import { MatchupsByCodePrefixZ, MatchupZ } from '@/lib/definitions';
import { getCodePrefixFromDate } from '@/lib/data_common';
import { getScoreboardByCode } from '@/lib/scoreboards';

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

export async function getWinningTeamByMatchupId(matchupId: string) {
  const matchup = await getMatchupById(matchupId);
  if (!matchup) throw new Error('Matchup not found');

  const scoreboard = await getScoreboardByCode(matchup.code);
  if (!scoreboard) throw new Error('Scoreboard not found');
  if (scoreboard.status !== 3) throw new Error('Scoreboard not final');

  const homeTeamWins = scoreboard.home_score > scoreboard.away_score;

  if (homeTeamWins) return matchup.home_code;

  return matchup.away_code;
}

export async function getMatchupsAndPicksByCodePrefix(codePrefix: string) {
  const pb = getAPB();
  const matchups = await pb.collection('matchups').getFullList({
    filter: pb.filter(`code ?~ {:codePrefix}`, { codePrefix }),
    expand: ['picks_via_matchup', 'picks_via_matchup.user'].join(','),
  });
  return matchups;
}

export async function getCodePrefixes() {
  const pb = getPB();
  const matchupsByCodePrefix = await pb
    .collection('matchups_by_code_prefix')
    .getFullList();
  return matchupsByCodePrefix.map((m) => MatchupsByCodePrefixZ.parse(m));
}
