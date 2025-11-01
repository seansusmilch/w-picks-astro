import { NextRequest, NextResponse } from 'next/server';
import { getAPB } from '@/lib/data';
import { getTodayMatchups } from '@/lib/matchups';
import {
  attachMatchupToScoreboard,
  getScoreboardByCode,
} from '@/lib/scoreboards';
import { updatePicksStatusByCode } from '@/lib/picks';
import { getLogger } from '@/lib/logger';
import { DateTime } from 'luxon';
import {
  trackPerformance,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/cron-utils';
import { fetchNBAScoreboardsEndpoint } from '@/lib/nba';
import type { NBAScoreboardsResponse } from '@/lib/types/nba-scoreboards';
import type { ScoreboardType } from '@/lib/definitions';

const logger = getLogger('update-scoreboards');
const CRON_SECRET = process.env.CRON_SECRET || '';

function parseScoreboards(rawData: NBAScoreboardsResponse): ScoreboardType[] {
  const todaysScoreboards = rawData.scoreboard.games;
  return todaysScoreboards.map((game) => ({
    code: game.gameCode,
    status: game.gameStatus,
    status_text: game.gameStatusText,
    away_score: game.awayTeam.score,
    home_score: game.homeTeam.score,
  }));
}

async function updatePicksStatus(scoreboard: ScoreboardType) {
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

async function updateScoreboard(scoreboard: ScoreboardType) {
  const pb = await getAPB();

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
  } catch (error: any) {
    logger.error({ error, scoreboard }, 'Error updating scoreboard');
    return {
      action: 'FAILED',
      scoreboard: scoreboard,
      error: error.message,
    };
  }
}

export async function POST(request: NextRequest) {
  if (request.headers.get('Cron-Secret') !== CRON_SECRET) {
    logger.warn('Unauthorized access attempt to update scoreboards endpoint');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobStartTime = performance.now();
  const startTime = DateTime.now().toISO();

  logger.info({ startTime }, 'Starting update scoreboards job');

  try {
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

      const response = createSuccessResponse(
        'No matchups today',
        jobStartTime,
        {
          matchupsToday: 0,
        }
      );
      return NextResponse.json(response.body, { status: response.status });
    }

    logger.info('Fetching scoreboards from NBA API');
    const fetchStart = performance.now();
    const scoreboardsJson = await fetchNBAScoreboardsEndpoint();
    const fetchEnd = performance.now();
    logger.info(
      { durationMs: (fetchEnd - fetchStart).toFixed(2) },
      'NBA API fetch completed'
    );

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

    logger.info('Updating scoreboards in database');
    const updateStart = performance.now();

    const scoreBoardUpdatePromises = scoreboards.map(async (scoreboard) => {
      const updateStart = performance.now();
      const res = await updateScoreboard(scoreboard);
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

    const response = createSuccessResponse(
      'Update scoreboards job completed',
      jobStartTime,
      {
        stats: {
          created: createdCount,
          updated: updatedCount,
          failed: failedCount,
        },
        metrics: additionalMetrics,
        results: results,
      }
    );
    return NextResponse.json(response.body, { status: response.status });
  } catch (error: any) {
    const response = createErrorResponse(error, jobStartTime, {
      startTime,
      jobType: 'update-scoreboards',
    });
    return NextResponse.json(response.body, { status: response.status });
  }
}
