import { NextRequest, NextResponse } from 'next/server';
import { getAPB } from '@/lib/data';
import { DateTime } from 'luxon';
import { getMatchupByCode } from '@/lib/matchups';
import type { MatchupType } from '@/lib/definitions';
import {
  getCronLogger,
  trackPerformance,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/cron-utils';
import { fetchNBAScheduleEndpoint } from '@/lib/nba';

const logger = getCronLogger('update-matchups');
const CRON_SECRET = process.env.CRON_SECRET || '';

const PAST_CUTOFF = 3;
const FUTURE_CUTOFF = 30;

interface NBAGame {
  gameCode: string;
  gameDateTimeUTC: string;
  awayTeam: { teamTricode: string; wins: number; losses: number };
  homeTeam: { teamTricode: string; wins: number; losses: number };
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
    away_meta: game.awayTeam,
    home_meta: game.homeTeam,
  }));
}

async function findMatchupsToDelete(
  matchups: Matchup[]
): Promise<MatchupType[]> {
  const pb = await getAPB();
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

  const apiGameCodes = new Set(matchups.map((game) => game.code));
  logger.info({ count: apiGameCodes.size }, 'Found game codes from NBA API');

  const matchupsToDelete = existingFutureMatchups.filter(
    (matchup) => !apiGameCodes.has(matchup.code)
  );

  if (matchupsToDelete.length > 0) {
    logger.info({ count: matchupsToDelete.length }, 'Found matchups to delete');
  } else {
    logger.info('No matchups need to be deleted');
  }

  return matchupsToDelete;
}

async function processMatchups(
  matchups: Matchup[]
): Promise<OperationResult[]> {
  const pb = await getAPB();
  const results: OperationResult[] = [];

  const batchTracker = logger.trackBatchOperation({
    name: 'process-matchups',
    totalItems: matchups.length,
    logProgressEvery: 10,
  });

  for (const matchup of matchups) {
    if (!matchup.code) {
      logger.warn({ matchup }, 'No code for matchup, skipping');
      results.push({
        matchup,
        action: 'SKIPPED',
        reason: 'Missing game code',
      });
      batchTracker.recordSuccess(matchup.code);
      continue;
    }

    try {
      const existingMatchup = await getMatchupByCode(matchup.code);

      if (existingMatchup) {
        const updatedRecord = await pb
          .collection<MatchupType>('matchups')
          .update(existingMatchup.id, matchup);

        results.push({
          id: updatedRecord.id,
          action: 'UPDATED',
        });
        batchTracker.recordSuccess(matchup.code);
      } else {
        const newRecord = await pb
          .collection<MatchupType>('matchups')
          .create(matchup);

        results.push({
          id: newRecord.id,
          action: 'CREATED',
        });
        batchTracker.recordSuccess(matchup.code);
      }
    } catch (error: any) {
      logger.error({ error, matchup }, 'Error processing matchup');
      results.push({
        matchup,
        action: 'FAILED',
        error: error.message,
      });
      batchTracker.recordError(error, matchup.code);
    }
  }

  const batchMetrics = batchTracker.complete();
  logger.info({ batchMetrics }, 'Matchup processing complete');

  return results;
}

async function deleteMatchups(
  matchupsToDelete: MatchupType[]
): Promise<OperationResult[]> {
  const pb = await getAPB();
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
    } catch (error: any) {
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

export async function POST(request: NextRequest) {
  if (request.headers.get('Cron-Secret') !== CRON_SECRET) {
    logger.warn('Unauthorized access attempt to update matchups endpoint');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobStartTime = performance.now();
  const startTime = DateTime.now().toISO();

  logger.info({ startTime }, 'Starting update matchups job');

  try {
    const fetchStart = performance.now();
    const matchupsJson = await fetchNBAScheduleEndpoint();
    const fetchEnd = performance.now();
    logger.info(
      { durationMs: (fetchEnd - fetchStart).toFixed(2) },
      'NBA API fetch completed'
    );

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

      const response = createSuccessResponse(
        'No matchups found in the specified date range.',
        jobStartTime,
        { success: false }
      );
      return NextResponse.json(response.body, { status: response.status });
    }

    const matchupsToDelete = await trackPerformance(
      'findMatchupsToDelete',
      async () => findMatchupsToDelete(matchups),
      logger
    );

    const processResults = await trackPerformance(
      'processMatchups',
      async () => processMatchups(matchups),
      logger
    );

    const deleteResults = await trackPerformance(
      'deleteMatchups',
      async () => deleteMatchups(matchupsToDelete),
      logger
    );

    const stats = generateStats([...processResults, ...deleteResults]);

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

    const response = createSuccessResponse(
      'Matchups updated successfully',
      jobStartTime,
      { stats, metrics: additionalMetrics }
    );
    return NextResponse.json(response.body, { status: response.status });
  } catch (error: any) {
    const response = createErrorResponse(error, jobStartTime, {
      startTime,
      jobType: 'update-matchups',
    });
    return NextResponse.json(response.body, { status: response.status });
  }
}
