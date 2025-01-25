import type { APIRoute } from 'astro';
import { getAPB } from '@/lib/data';
import { CRON_SECRET } from 'astro:env/server';
import { getTodayMatchups } from '@/lib/matchups';
import { getScoreboardByCode } from '@/lib/scoreboards';

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
    status_text: [game.gameStatusText, game.gameClock]
      .map((s) => s.trim())
      .join(' '),
    away_score: game.awayTeam.score,
    home_score: game.homeTeam.score,
  }));
}

export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get('Cron-Secret') !== CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Check if there are matchups today
    const todaysMatchups = await getTodayMatchups();
    console.log('todaysMatchups', todaysMatchups);
    if (todaysMatchups.length === 0) {
      return new Response(JSON.stringify({ message: 'No matchups today' }), {
        status: 200,
      });
    }

    // Fetch scoreboards from NBA API
    const response = await fetch(NBA_SCOREBOARDS_URL);
    const scoreboardsJson = await response.json();
    const scoreboards = parseScoreboards(scoreboardsJson);
    const pb = getAPB();

    // Update each scoreboard in PocketBase
    const results = await Promise.all(
      scoreboards.map(async (scoreboard) => {
        try {
          const existingScoreboard = await getScoreboardByCode(scoreboard.code);
          if (existingScoreboard) {
            const newRec = await pb
              .collection('scoreboards')
              .update(existingScoreboard.id, scoreboard, {
                requestKey: Date.now().toString(),
              });
            return { action: 'UPDATED', id: newRec.id };
          }

          const newRec = await pb.collection('scoreboards').create(scoreboard, {
            requestKey: Date.now().toString(),
          });
          return { action: 'CREATED', id: newRec.id };
        } catch (error) {
          console.log('error', error);
          return {
            action: 'FAILED',
            scoreboard: scoreboard,
            error: error.message,
          };
        }
      })
    );

    const createdCount = results.filter((r) => r.action === 'CREATED').length;
    const updatedCount = results.filter((r) => r.action === 'UPDATED').length;
    const failed = results.filter((r) => r.action === 'FAILED');
    const failedCount = failed.length;

    console.log('failed', failed);

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
    console.error('Error updating scoreboards:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update scoreboards' }),
      {
        status: 500,
      }
    );
  }
};
