import { getAPB, getPB } from '@/lib/data';
import { ScoreboardZ, type ScoreboardType } from '@/lib/definitions';
import { getMatchupByCode, getMatchupById } from '@/lib/matchups';
import { getLogger } from '@/lib/logger';

// Create a named logger for this file
const logger = getLogger('scoreboards');

export function validateScoreboard(scoreboard: any) {
  const scoreboardResult = ScoreboardZ.safeParse(scoreboard);
  if (!scoreboardResult.success) {
    logger.error(
      { error: scoreboardResult.error },
      'Failed to parse scoreboard'
    );
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

  logger.debug({ gameCode, scoreboardId }, 'Attaching matchup to scoreboard');

  const pb = await getAPB();
  await pb.collection('matchups').update(matchup.id, {
    scoreboard: scoreboardId,
  });
}

export async function getScoreboardsByCodePrefix(codePrefix: string) {
  const pb = await getAPB();
  const scoreboards = await pb.collection('scoreboards').getFullList({
    filter: pb.filter(`code ?~ {:codePrefix}`, { codePrefix }),
  });
  return scoreboards;
}

export async function updateScoreboard(scoreboard: ScoreboardType) {
  const pb = await getAPB();

  // await attachAllExistingMatchupsToScoreboards();

  try {
    const existingScoreboard = await getScoreboardByCode(scoreboard.code);
    if (existingScoreboard) {
      const newRec = await pb
        .collection('scoreboards')
        .update(existingScoreboard.id, scoreboard);
      await attachMatchupToScoreboard(existingScoreboard.id, scoreboard.code);
      return { action: 'UPDATED', id: newRec.id };
    }

    const newRec = await pb.collection('scoreboards').create(scoreboard);
    await attachMatchupToScoreboard(newRec.id, scoreboard.code);
    return { action: 'CREATED', id: newRec.id };
  } catch (error) {
    logger.error({ error, scoreboard }, 'Error updating scoreboard');
    return {
      action: 'FAILED',
      scoreboard: scoreboard,
      error: error.message,
    };
  }
}
