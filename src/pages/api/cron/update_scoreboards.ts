import type { APIRoute } from 'astro';
import { getAPB } from '@/lib/data';
import { CRON_SECRET } from 'astro:env/server';
import { getMatchupByCode, getTodayMatchups } from '@/lib/matchups';
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

// Create a named logger for this file
const logger = getLogger('update-scoreboards');

const NBA_SCOREBOARDS_URL =
  'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json';

interface Scoreboard {
  code: string;
  status: number;
  status_text: string;
  away_score: number;
  home_score: number;
}

interface NBAScoreboardResponse {
  scoreboard: {
    games: Array<{
      gameCode: string;
      gameStatus: number;
      gameStatusText: string;
      gameClock: string;
      awayTeam: {
        score: number;
      };
      homeTeam: {
        score: number;
      };
    }>;
  };
}

function parseScoreboards(rawData: NBAScoreboardResponse): Scoreboard[] {
  const todaysScoreboards = rawData.scoreboard.games;
  return todaysScoreboards.map((game) => ({
    code: game.gameCode,
    status: game.gameStatus,
    status_text: game.gameStatusText,
    away_score: game.awayTeam.score,
    home_score: game.homeTeam.score,
  }));
}

async function updatePicksStatus(scoreboard: Scoreboard) {
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

async function updateScoreboard(scoreboard: Scoreboard) {
  const pb = getAPB();

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

export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get('Cron-Secret') !== CRON_SECRET) {
    logger.warn('Unauthorized access attempt to update scoreboards endpoint');
    return new Response('Unauthorized', { status: 401 });
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

      return createSuccessResponse('No matchups today', jobStartTime, {
        matchupsToday: 0,
      });
    }

    // Fetch scoreboards from NBA API with performance tracking
    logger.info('Fetching scoreboards from NBA API');
    const fetchStart = performance.now();
    const response = await fetch(NBA_SCOREBOARDS_URL);
    const scoreboardsJson = await response.json();
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

    return createSuccessResponse(
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
  } catch (error) {
    return createErrorResponse(error, jobStartTime, {
      startTime,
      jobType: 'update-scoreboards',
    });
  }
};
