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

  logger.info('Starting update scoreboards job');
  try {
    // Check if there are matchups today
    const todaysMatchups = await getTodayMatchups();
    if (todaysMatchups.length === 0) {
      logger.info('No matchups today, skipping scoreboard update');
      return new Response(JSON.stringify({ message: 'No matchups today' }), {
        status: 200,
      });
    }

    // Fetch scoreboards from NBA API
    logger.info('Fetching scoreboards from NBA API');
    const response = await fetch(NBA_SCOREBOARDS_URL);
    const scoreboardsJson = await response.json();
    const scoreboards = parseScoreboards(scoreboardsJson);
    logger.info({ count: scoreboards.length }, 'Fetched scoreboards');

    // Update each scoreboard in PocketBase
    logger.info('Updating scoreboards in database');
    const results = await Promise.all(
      scoreboards.map(async (scoreboard) => {
        const res = await updateScoreboard(scoreboard);
        await updatePicksStatus(scoreboard);
        return res;
      })
    );

    const createdCount = results.filter((r) => r.action === 'CREATED').length;
    const updatedCount = results.filter((r) => r.action === 'UPDATED').length;
    const failed = results.filter((r) => r.action === 'FAILED');
    const failedCount = failed.length;

    logger.info(
      { created: createdCount, updated: updatedCount, failed: failedCount },
      'Update scoreboards job completed'
    );

    if (failedCount > 0) {
      logger.warn({ failed }, 'Some scoreboard updates failed');
    }

    return new Response(
      JSON.stringify(
        {
          message: 'Update scoreboards job completed',
          stats: {
            created: createdCount,
            updated: updatedCount,
            failed: failedCount,
          },
          results: results,
        },
        null,
        4
      ),
      {
        status: 200,
      }
    );
  } catch (error) {
    logger.error({ error }, 'Error updating scoreboards');
    return new Response(
      JSON.stringify({ error: 'Failed to update scoreboards' }),
      {
        status: 500,
      }
    );
  }
};
