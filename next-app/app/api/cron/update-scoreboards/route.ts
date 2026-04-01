import { NextResponse } from 'next/server';
import {
  getTodayMatchups,
  updatePicksStatusByCode,
  updateScoreboard as updateScoreboardRecord,
} from '@/app/actions/cron';
import { getLogger } from '@/lib/logger';
import { DateTime } from 'luxon';
import {
  trackPerformance,
  createErrorResponse,
  generateExecutionMetrics,
} from '@/lib/cron-utils';
import { fetchNBAScoreboardsEndpoint } from '@/lib/nba';
import type { NBAScoreboardsResponse } from '@/lib/types/nba-scoreboards';
import type { ScoreboardType } from '@/lib/definitions';

// Create a named logger for this file
const logger = getLogger('update-scoreboards');

function parseScoreboards(
  rawData: NBAScoreboardsResponse
): Omit<ScoreboardType, 'id' | 'created' | 'updated'>[] {
  const todaysScoreboards = rawData.scoreboard.games;
  return todaysScoreboards.map((game) => ({
    code: game.gameCode,
    status: game.gameStatus,
    status_text: game.gameStatusText,
    away_score: game.awayTeam.score,
    home_score: game.homeTeam.score,
  }));
}

async function updatePicksStatus(
  scoreboard: Omit<ScoreboardType, 'id' | 'created' | 'updated'>
) {
  logger.info(
    { code: scoreboard.code, status: scoreboard.status },
    'Updating picks status'
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

// updateScoreboard is imported from cron helpers

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
    logger.warn('Unauthorized access attempt to update scoreboards endpoint');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobStartTime = performance.now();
  const startTime = DateTime.now().toISO();

  logger.info({ startTime }, 'Starting update scoreboards job');

  try {
    // Check if there are matchups today with performance tracking
    const todaysMatchups = await trackPerformance(
      'getTodayMatchups',
      async () => getTodayMatchups(),
      logger
    );

    if (todaysMatchups.length === 0) {
      logger.info(
        {
          durationMs: (performance.now() - jobStartTime).toFixed(2),
          startTime,
          endTime: DateTime.now().toISO(),
        },
        'No matchups today, skipping scoreboard update'
      );

      return NextResponse.json({
        success: true,
        message: 'No matchups today',
        metrics: generateExecutionMetrics(jobStartTime, {
          matchupsToday: 0,
        }),
      });
    }

    // Fetch scoreboards from NBA API with performance tracking
    logger.info('Fetching scoreboards from NBA API');
    const fetchStart = performance.now();
    const scoreboardsJson = await fetchNBAScoreboardsEndpoint();
    const fetchEnd = performance.now();
    logger.info(
      { durationMs: (fetchEnd - fetchStart).toFixed(2) },
      'NBA API fetch completed'
    );

    // Parse scoreboards
    const parseStart = performance.now();
    const scoreboards = parseScoreboards(scoreboardsJson);
    const parseEnd = performance.now();
    logger.info(
      {
        count: scoreboards.length,
        durationMs: (parseEnd - parseStart).toFixed(2),
      },
      'Parsed scoreboards'
    );

    // Update each scoreboard in PocketBase with performance tracking
    logger.info('Updating scoreboards in database');
    const updateStart = performance.now();

    // Track individual scoreboard updates
    const scoreBoardUpdatePromises = scoreboards.map(async (scoreboard) => {
      const updateStart = performance.now();
      const res = await updateScoreboardRecord(scoreboard);
      const statusUpdateStart = performance.now();
      await updatePicksStatus(scoreboard);
      const endTime = performance.now();

      return {
        ...res,
        metrics: {
          scoreboardUpdateMs: (statusUpdateStart - updateStart).toFixed(2),
          statusUpdateMs: (endTime - statusUpdateStart).toFixed(2),
          totalMs: (endTime - updateStart).toFixed(2),
        },
      };
    });

    const results = await Promise.all(scoreBoardUpdatePromises);
    const updateEnd = performance.now();

    const createdCount = results.filter((r) => r.action === 'CREATED').length;
    const updatedCount = results.filter((r) => r.action === 'UPDATED').length;
    const failed = results.filter((r) => r.action === 'FAILED');
    const failedCount = failed.length;

    // Add execution metrics
    const additionalMetrics = {
      startTime,
      scoreboardsFetchMs: (fetchEnd - fetchStart).toFixed(2),
      scoreboardsParseMs: (parseEnd - parseStart).toFixed(2),
      scoreboardsUpdateMs: (updateEnd - updateStart).toFixed(2),
      matchupsToday: todaysMatchups.length,
      scoreboardsFound: scoreboards.length,
    };

    logger.info(
      {
        created: createdCount,
        updated: updatedCount,
        failed: failedCount,
        durationMs: (performance.now() - jobStartTime).toFixed(2),
        ...additionalMetrics,
      },
      'Update scoreboards job completed'
    );

    if (failedCount > 0) {
      logger.warn({ failed }, 'Some scoreboard updates failed');
    }

    return NextResponse.json({
      success: true,
      message: 'Update scoreboards job completed',
      metrics: generateExecutionMetrics(jobStartTime, additionalMetrics),
      stats: {
        created: createdCount,
        updated: updatedCount,
        failed: failedCount,
      },
      results: results,
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error, jobStartTime, {
      startTime,
      jobType: 'update-scoreboards',
    });
    const errorData = await errorResponse.json();
    return NextResponse.json(errorData, { status: 500 });
  }
}
