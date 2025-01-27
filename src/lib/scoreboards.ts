import { getAPB, getPB } from '@/lib/data';
import { ScoreboardZ } from '@/lib/definitions';
import { getMatchupByCode, getMatchupById } from '@/lib/matchups';

export function validateScoreboard(scoreboard: any) {
  const scoreboardResult = ScoreboardZ.safeParse(scoreboard);
  if (!scoreboardResult.success) {
    console.error('Failed to parse scoreboard:', scoreboardResult.error);
    throw new Error('Failed to parse scoreboard');
  }
  return scoreboardResult.data;
}

export async function getScoreboardById(id: string) {
  const pb = getPB();
  const scoreboardRecord = await pb.collection('scoreboards').getOne(id);
  return validateScoreboard(scoreboardRecord);
}

export async function getScoreboardByCode(code: string) {
  const pb = getPB();
  const scoreboardRecord = await pb
    .collection('scoreboards')
    .getFirstListItem(pb.filter(`code = {:code}`, { code }))
    .catch(() => null);

  if (!scoreboardRecord) return null;

  return validateScoreboard(scoreboardRecord);
}

export async function getScoreboardByMatchupId(matchupId: string) {
  const matchup = await getMatchupById(matchupId);
  if (!matchup) return null;
  const scoreboardRecord = await getScoreboardByCode(matchup.code);
  if (!scoreboardRecord) return null;

  return validateScoreboard(scoreboardRecord);
}

export async function attachMatchupToScoreboard(
  scoreboardId: string,
  gameCode: string
) {
  const matchup = await getMatchupByCode(gameCode);
  if (!matchup || matchup.scoreboard === scoreboardId) return;

  console.log('attaching matchup to scoreboard', gameCode, scoreboardId);

  const pb = getAPB();
  await pb.collection('matchups').update(matchup.id, {
    scoreboard: scoreboardId,
  });
}

export async function getScoreboardsByCodePrefix(codePrefix: string) {
  const pb = getAPB();
  const scoreboards = await pb.collection('scoreboards').getFullList({
    filter: pb.filter(`code ?~ {:codePrefix}`, { codePrefix }),
  });
  return scoreboards;
}
