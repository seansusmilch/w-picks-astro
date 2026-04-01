'use server';

import { getAdminPocketBase } from '@/lib/pocketbase-server';
import { getMatchupByCode } from '@/app/actions/matchups';
import type { MatchupType, ScoreboardType } from '@/lib/definitions';
import { MatchupZ, ScoreboardZ, PickZ } from '@/lib/definitions';
import { getLogger } from '@/lib/logger';
import { getCodePrefixFromDate } from '@/lib/date-utils';

const logger = getLogger('cron-helpers');

/**
 * Get matchups for today using code prefix
 */
export async function getTodayMatchups(): Promise<MatchupType[]> {
  const pb = await getAdminPocketBase();
  const codePrefix = getCodePrefixFromDate(new Date());

  try {
    const response = await pb.collection('matchups').getList(1, 100, {
      filter: `code ?~ "${codePrefix}"`,
    });

    const matchups: MatchupType[] = [];
    for (const record of response.items) {
      const parsed = MatchupZ.safeParse(record);
      if (parsed.success) {
        matchups.push(parsed.data);
      }
    }

    logger.info(
      { count: matchups.length, codePrefix },
      'Fetched today matchups'
    );
    return matchups;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        codePrefix,
      },
      'Failed to fetch today matchups'
    );
    return [];
  }
}

/**
 * Attach a matchup to a scoreboard by linking them
 */
export async function attachMatchupToScoreboard(
  scoreboardId: string,
  gameCode: string
): Promise<void> {
  const matchup = await getMatchupByCode(gameCode);
  if (!matchup || matchup.scoreboard === scoreboardId) {
    return;
  }

  logger.debug({ gameCode, scoreboardId }, 'Attaching matchup to scoreboard');

  const pb = await getAdminPocketBase();
  await pb.collection('matchups').update(matchup.id, {
    scoreboard: scoreboardId,
  });
}

/**
 * Update picks status by game code
 */
export async function updatePicksStatusByCode(
  code: string,
  status: 'upcoming' | 'live' | 'past'
): Promise<void> {
  const matchup = await getMatchupByCode(code);
  if (!matchup) {
    logger.warn({ code }, 'Matchup not found for updating picks status');
    return;
  }

  await updatePicksStatusByMatchupId(matchup.id, status);
}

/**
 * Update picks status by matchup ID
 */
async function updatePicksStatusByMatchupId(
  matchupId: string,
  status: 'upcoming' | 'live' | 'past'
): Promise<void> {
  const pb = await getAdminPocketBase();
  const picks = await pb.collection('picks').getFullList({
    filter: `matchup = "${matchupId}"`,
  });

  if (picks.length === 0) {
    return;
  }

  logger.info(
    { matchupId, status, picksCount: picks.length },
    'Updating picks status'
  );

  // If status is 'past', we need to determine win/loss
  if (status === 'past') {
    // Get the matchup and scoreboard to determine winner
    const matchup = await pb.collection('matchups').getOne(matchupId);
    if (!matchup.scoreboard) {
      logger.warn({ matchupId }, 'No scoreboard found for past matchup');
      return;
    }

    const scoreboard = await pb
      .collection('scoreboards')
      .getOne(matchup.scoreboard);
    const homeWins = scoreboard.home_score > scoreboard.away_score;
    const winningTeam = homeWins ? matchup.home_code : matchup.away_code;

    await Promise.all(
      picks.map(async (pick) => {
        const parsedPick = PickZ.safeParse(pick);
        if (!parsedPick.success) {
          logger.warn({ pickId: pick.id }, 'Failed to parse pick');
          return;
        }

        const result =
          parsedPick.data.win_prediction === winningTeam ? 'W' : 'L';
        await pb.collection('picks').update(pick.id, {
          status: 'past',
          result,
        });
      })
    );
  } else {
    // For 'upcoming' or 'live', just update status
    await Promise.all(
      picks.map(async (pick) => {
        await pb.collection('picks').update(pick.id, { status });
      })
    );
  }
}

/**
 * Update picks status based on scoreboard status
 */
export async function updatePicksStatus(
  scoreboard: ScoreboardType
): Promise<void> {
  logger.info(
    { code: scoreboard.code, status: scoreboard.status },
    'Updating picks status based on scoreboard'
  );

  switch (scoreboard.status) {
    case 1:
      await updatePicksStatusByCode(scoreboard.code, 'upcoming');
      break;
    case 2:
      await updatePicksStatusByCode(scoreboard.code, 'live');
      break;
    case 3:
      await updatePicksStatusByCode(scoreboard.code, 'past');
      break;
    default:
      logger.warn(
        { code: scoreboard.code, status: scoreboard.status },
        'Unknown scoreboard status'
      );
      break;
  }
}

/**
 * Get scoreboard from database by code (for cron jobs)
 * This is separate from the API-based getScoreboardByCode used by components
 */
async function getScoreboardFromDatabaseByCode(
  code: string
): Promise<ScoreboardType | null> {
  const pb = await getAdminPocketBase();

  try {
    const scoreboardRecord = await pb
      .collection('scoreboards')
      .getFirstListItem(`code = "${code}"`)
      .catch(() => null);

    if (!scoreboardRecord) {
      return null;
    }

    const parsedScoreboard = ScoreboardZ.safeParse(scoreboardRecord);
    if (!parsedScoreboard.success) {
      logger.warn(
        {
          code,
          validationErrors: parsedScoreboard.error.issues,
        },
        'Scoreboard validation failed in database'
      );
      return null;
    }

    return parsedScoreboard.data;
  } catch (error) {
    logger.error(
      {
        code,
        error: error instanceof Error ? error.message : String(error),
      },
      'Failed to fetch scoreboard from database'
    );
    return null;
  }
}

/**
 * Create or update a minimal scoreboard record in the database
 * Only stores: code, status, status_text, home_score, away_score
 * This is used by cron jobs for pick locking logic
 */
export async function updateScoreboard(
  scoreboard: Omit<ScoreboardType, 'id' | 'created' | 'updated'>
): Promise<{
  action: 'CREATED' | 'UPDATED' | 'FAILED';
  id?: string;
  error?: string;
}> {
  const pb = await getAdminPocketBase();

  try {
    // Check database for existing scoreboard (not API)
    const existingScoreboard = await getScoreboardFromDatabaseByCode(
      scoreboard.code
    );
    if (existingScoreboard) {
      // Only update minimal fields needed for pick locking
      const updatedRecord = await pb
        .collection('scoreboards')
        .update(existingScoreboard.id, {
          code: scoreboard.code,
          status: scoreboard.status,
          status_text: scoreboard.status_text,
          home_score: scoreboard.home_score,
          away_score: scoreboard.away_score,
        });
      await attachMatchupToScoreboard(existingScoreboard.id, scoreboard.code);
      return { action: 'UPDATED', id: updatedRecord.id };
    }

    // Create new minimal scoreboard record
    const newRecord = await pb.collection('scoreboards').create({
      code: scoreboard.code,
      status: scoreboard.status,
      status_text: scoreboard.status_text,
      home_score: scoreboard.home_score,
      away_score: scoreboard.away_score,
    });
    await attachMatchupToScoreboard(newRecord.id, scoreboard.code);
    return { action: 'CREATED', id: newRecord.id };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        scoreboard,
      },
      'Error updating scoreboard in database'
    );
    return {
      action: 'FAILED',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
