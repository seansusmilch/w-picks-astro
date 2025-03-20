import { getAPB } from '@/lib/data';
import { type APIRoute } from 'astro';
import { DateTime } from 'luxon';
import { CRON_SECRET } from 'astro:env/server';
import { getMatchupByCode } from '@/lib/matchups';
import type { MatchupType } from '@/lib/definitions';
import { getLogger } from '@/lib/logger';

// Create a named logger for this file
const logger = getLogger('update-matchups');

const PAST_CUTOFF = 3;
const FUTURE_CUTOFF = 30;
const NBA_SCHEDULE_URL =
  'https://cdn.nba.com/static/json/staticData/scheduleLeagueV2_1.json';

interface NBAGame {
  gameCode: string;
  gameDateTimeUTC: string;
  awayTeam: { teamTricode: string };
  homeTeam: { teamTricode: string };
}

interface GameDate {
  gameDate: string;
  games: NBAGame[];
}

interface ScheduleResponse {
  leagueSchedule: {
    gameDates: GameDate[];
  };
}

interface Matchup {
  code: string;
  time_utc: string;
  away_code: string;
  home_code: string;
}

interface OperationResult {
  id?: string;
  matchup?: any;
  action:
    | 'CREATED'
    | 'UPDATED'
    | 'FAILED'
    | 'DELETE_FAILED'
    | 'SKIPPED'
    | 'DELETED';
  error?: string;
  reason?: string;
}

function parseMatchups(rawData: ScheduleResponse): Matchup[] {
  const pastCutoff = DateTime.now().minus({ days: PAST_CUTOFF });
  const futureCutoff = DateTime.now().plus({ days: FUTURE_CUTOFF });

  const filteredDates = rawData.leagueSchedule.gameDates.filter((date) => {
    const gameDate = DateTime.fromFormat(date.gameDate, 'MM/dd/yyyy 00:00:00');
    if (!gameDate.isValid) {
      logger.warn({ gameDate: date.gameDate }, 'Failed to parse gameDate');
      return false;
    }

    return gameDate > pastCutoff && gameDate < futureCutoff;
  });

  const allGames = filteredDates.flatMap((date) => date.games);
  logger.info({ count: allGames.length }, 'Filtered games for processing');
  return allGames.map((game) => ({
    code: game.gameCode,
    time_utc: game.gameDateTimeUTC,
    away_code: game.awayTeam.teamTricode,
    home_code: game.homeTeam.teamTricode,
  }));
}

async function findMatchupsToDelete(
  matchups: Matchup[]
): Promise<MatchupType[]> {
  const pb = getAPB();
  // Get existing future matchups from our database
  const existingFutureMatchups = await pb
    .collection<MatchupType>('matchups')
    .getFullList({
      filter: pb.filter('time_utc > {:now}', { now: new Date() }),
      batch: 2000,
    });

  logger.info(
    { count: existingFutureMatchups.length },
    'Found existing future matchups in database'
  );

  // Extract game codes from the API future matchups
  const apiGameCodes = new Set(matchups.map((game) => game.code));
  logger.info({ count: apiGameCodes.size }, 'Found game codes from NBA API');

  // Find matchups that don't exist in the NBA API data anymore
  const matchupsToDelete = existingFutureMatchups.filter(
    (matchup) => !apiGameCodes.has(matchup.code)
  );

  // Log matchups to delete
  if (matchupsToDelete.length > 0) {
    logger.info({ count: matchupsToDelete.length }, 'Found matchups to delete');

    matchupsToDelete.forEach((matchup, index) => {
      logger.debug(
        {
          index: index + 1,
          id: matchup.id,
          teams: `${matchup.away_code} @ ${matchup.home_code}`,
          time: matchup.time_utc,
        },
        'Matchup scheduled for deletion'
      );
    });
  } else {
    logger.info('No matchups need to be deleted');
  }

  return matchupsToDelete;
}

async function processMatchups(
  matchups: Matchup[]
): Promise<OperationResult[]> {
  const pb = getAPB();
  const results: OperationResult[] = [];

  for (const matchup of matchups) {
    // Skip matchups without codes
    if (!matchup.code) {
      logger.warn({ matchup }, 'No code for matchup, skipping');
      results.push({
        matchup,
        action: 'SKIPPED',
        reason: 'Missing game code',
      });
      continue;
    }

    try {
      const existingMatchup = await getMatchupByCode(matchup.code);

      if (existingMatchup) {
        // Update existing matchup
        const updatedRecord = await pb
          .collection<MatchupType>('matchups')
          .update(existingMatchup.id, matchup);

        results.push({
          id: updatedRecord.id,
          action: 'UPDATED',
        });
      } else {
        // Create new matchup
        const newRecord = await pb
          .collection<MatchupType>('matchups')
          .create(matchup);

        results.push({
          id: newRecord.id,
          action: 'CREATED',
        });
      }
    } catch (error) {
      logger.error({ error, matchup }, 'Error processing matchup');
      results.push({
        matchup,
        action: 'FAILED',
        error: error.message,
      });
    }
  }

  return results;
}

async function deleteMatchups(
  matchupsToDelete: MatchupType[]
): Promise<OperationResult[]> {
  const pb = getAPB();
  const results: OperationResult[] = [];

  for (const matchup of matchupsToDelete) {
    try {
      // await pb.collection<MatchupType>('matchups').delete(matchup.id);

      results.push({
        id: matchup.id,
        matchup: {
          id: matchup.id,
          code: matchup.code,
          teams: `${matchup.away_code} @ ${matchup.home_code}`,
          time: matchup.time_utc,
        },
        action: 'DELETED',
      });
    } catch (error) {
      logger.error(
        { error, id: matchup.id, code: matchup.code },
        'Error deleting matchup'
      );
      results.push({
        id: matchup.id,
        matchup: {
          id: matchup.id,
          code: matchup.code,
          teams: `${matchup.away_code} @ ${matchup.home_code}`,
          time: matchup.time_utc,
        },
        action: 'DELETE_FAILED',
        error: error.message,
      });
    }
  }

  return results;
}

function generateStats(results: OperationResult[]): any {
  return {
    created: results.filter((r) => r.action === 'CREATED').length,
    updated: results.filter((r) => r.action === 'UPDATED').length,
    failed: results.filter((r) => r.action === 'FAILED').length,
    skipped: results.filter((r) => r.action === 'SKIPPED').length,
    deleted: results.filter((r) => r.action === 'DELETED').length,
    deletesFailed: results.filter((r) => r.action === 'DELETE_FAILED').length,
  };
}

export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get('Cron-Secret') !== CRON_SECRET) {
    logger.warn('Unauthorized access attempt to update matchups endpoint');
    return new Response('Unauthorized', { status: 401 });
  }

  logger.info('Starting update matchups job');
  try {
    const response = await fetch(NBA_SCHEDULE_URL);
    const matchupsJson = await response.json();
    const matchups = parseMatchups(matchupsJson);
    if (matchups.length === 0) {
      logger.warn('No matchups found. Possibly upstream API error');
      return new Response(
        JSON.stringify({
          message: 'No matchups found. Possibly upstream API error',
          matchupResponse: matchupsJson,
        }),
        { status: 200 }
      );
    }

    // Find matchups to delete and process operations
    logger.info('Looking for matchups to delete');
    const matchupsToDelete = await findMatchupsToDelete(matchups);

    logger.info('Processing matchups');
    const results = await processMatchups(matchups);

    logger.info('Deleting outdated matchups');
    const deleteResults = await deleteMatchups(matchupsToDelete);

    // Combine all results
    const allResults = [...results, ...deleteResults];
    const stats = generateStats(allResults);

    // Check for failures
    const failures = allResults.filter(
      (r) => r.action === 'FAILED' || r.action === 'DELETE_FAILED'
    );

    if (failures.length > 0) {
      logger.warn({ count: failures.length, failures }, 'Failed operations');
    }

    logger.info({ stats }, 'Update matchups job completed');

    // Return response
    return new Response(
      JSON.stringify(
        {
          message: 'Update matchups job completed',
          stats,
          results: allResults,
        },
        null,
        2
      ),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    logger.error('Error updating matchups:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update matchups' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
