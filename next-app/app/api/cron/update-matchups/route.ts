import { NextResponse } from 'next/server';
import { getAdminPocketBase } from '@/lib/pocketbase-server';
import { DateTime } from 'luxon';
import { getMatchupByCode } from '@/app/actions/matchups';
import type { MatchupType } from '@/lib/definitions';
import {
  getCronLogger,
  trackPerformance,
  createErrorResponse,
  generateExecutionMetrics,
} from '@/lib/cron-utils';
import { fetchNBAScheduleEndpoint } from '@/lib/nba';
import type { NBAScheduleResponse } from '@/lib/types/nba-schedule';

// Create a named enhanced logger for this file
const logger = getCronLogger('update-matchups');

const PAST_CUTOFF = 3;
const FUTURE_CUTOFF = 30;

interface Matchup {
  code: string;
  time_utc: string;
  away_code: string;
  home_code: string;
  away_meta: {
    wins: number;
    losses: number;
  };
  home_meta: {
    wins: number;
    losses: number;
  };
}

interface OperationResult {
  id?: string;
  matchup?: Matchup | { id: string; code: string; teams: string; time: string };
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

function parseMatchups(rawData: NBAScheduleResponse): Matchup[] {
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
    away_meta: game.awayTeam,
    home_meta: game.homeTeam,
  }));
}

async function findMatchupsToDelete(
  matchups: Matchup[]
): Promise<MatchupType[]> {
  const pb = await getAdminPocketBase();
  // Get existing future matchups from our database
  const existingFutureMatchups = await pb
    .collection<MatchupType>('matchups')
    .getFullList({
      filter: `time_utc > "${new Date().toISOString()}"`,
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
  const pb = await getAdminPocketBase();
  const results: OperationResult[] = [];

  // Create a batch operation tracker
  const batchTracker = logger.trackBatchOperation({
    name: 'process-matchups',
    totalItems: matchups.length,
    logProgressEvery: 10,
  });

  for (const matchup of matchups) {
    // Skip matchups without codes
    if (!matchup.code) {
      logger.warn({ matchup }, 'No code for matchup, skipping');
      results.push({
        matchup,
        action: 'SKIPPED',
        reason: 'Missing game code',
      });
      batchTracker.recordSuccess(matchup.code); // Still count as processed
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
        batchTracker.recordSuccess(matchup.code);
      } else {
        // Create new matchup
        const newRecord = await pb
          .collection<MatchupType>('matchups')
          .create(matchup);

        results.push({
          id: newRecord.id,
          action: 'CREATED',
        });
        batchTracker.recordSuccess(matchup.code);
      }
    } catch (error) {
      logger.error({ error, matchup }, 'Error processing matchup');
      results.push({
        matchup,
        action: 'FAILED',
        error: error instanceof Error ? error.message : String(error),
      });
      batchTracker.recordError(error, matchup.code);
    }
  }

  // Complete the batch operation and log final metrics
  const batchMetrics = batchTracker.complete();
  logger.info({ batchMetrics }, 'Matchup processing complete');

  return results;
}

async function deleteMatchups(
  matchupsToDelete: MatchupType[]
): Promise<OperationResult[]> {
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
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
}

interface OperationStats {
  created: number;
  updated: number;
  failed: number;
  skipped: number;
  deleted: number;
  deletesFailed: number;
}

function generateStats(results: OperationResult[]): OperationStats {
  return {
    created: results.filter((r) => r.action === 'CREATED').length,
    updated: results.filter((r) => r.action === 'UPDATED').length,
    failed: results.filter((r) => r.action === 'FAILED').length,
    skipped: results.filter((r) => r.action === 'SKIPPED').length,
    deleted: results.filter((r) => r.action === 'DELETED').length,
    deletesFailed: results.filter((r) => r.action === 'DELETE_FAILED').length,
  };
}

export async function POST(request: Request) {
  const cronSecret = request.headers.get('Cron-Secret');
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    logger.error('CRON_SECRET environment variable is not set');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  if (cronSecret !== expectedSecret) {
    logger.warn('Unauthorized access attempt to update matchups endpoint');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobStartTime = performance.now();
  const startTime = DateTime.now().toISO();

  logger.info({ startTime }, 'Starting update matchups job');

  try {
    // Track NBA API fetch
    const fetchStart = performance.now();
    const matchupsJson = await fetchNBAScheduleEndpoint();
    const fetchEnd = performance.now();
    logger.info(
      { durationMs: (fetchEnd - fetchStart).toFixed(2) },
      'NBA API fetch completed'
    );

    // Parse and process matchups with performance tracking
    const matchups = await trackPerformance(
      'parseMatchups',
      async () => parseMatchups(matchupsJson),
      logger
    );

    if (matchups.length === 0) {
      logger.warn(
        {
          durationMs: (performance.now() - jobStartTime).toFixed(2),
          startTime,
          endTime: DateTime.now().toISO(),
        },
        'No matchups found. Possibly upstream API error'
      );

      return NextResponse.json(
        {
          success: false,
          message: 'No matchups found in the specified date range.',
          metrics: generateExecutionMetrics(jobStartTime, {
            startTime,
            success: false,
          }),
        },
        { status: 200 }
      );
    }

    // Find matchups to delete with performance tracking
    const matchupsToDelete = await trackPerformance(
      'findMatchupsToDelete',
      async () => findMatchupsToDelete(matchups),
      logger
    );

    // Process matchups with performance tracking
    const processResults = await trackPerformance(
      'processMatchups',
      async () => processMatchups(matchups),
      logger
    );

    // Delete matchups with performance tracking
    const deleteResults = await trackPerformance(
      'deleteMatchups',
      async () => deleteMatchups(matchupsToDelete),
      logger
    );

    // Generate operation stats
    const stats = generateStats([...processResults, ...deleteResults]);

    // Add additional execution metrics
    const additionalMetrics = {
      startTime,
      matchupsFound: matchups.length,
      matchupsToDeleteFound: matchupsToDelete.length,
    };

    logger.info(
      {
        ...stats,
        durationMs: (performance.now() - jobStartTime).toFixed(2),
        ...additionalMetrics,
      },
      'Update matchups job completed'
    );

    return NextResponse.json({
      success: true,
      message: 'Matchups updated successfully',
      metrics: generateExecutionMetrics(jobStartTime, additionalMetrics),
      stats,
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error, jobStartTime, {
      startTime,
      jobType: 'update-matchups',
    });
    const errorData = await errorResponse.json();
    return NextResponse.json(errorData, { status: 500 });
  }
}

