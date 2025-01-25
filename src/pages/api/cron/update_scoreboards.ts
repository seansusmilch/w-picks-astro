import type { APIRoute } from 'astro';
import { getAPB } from '@/lib/data';
import { CRON_SECRET } from 'astro:env/server';
import { getTodayMatchups } from '@/lib/matchups';

const NBA_SCOREBOARDS_URL =
  'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json';

interface Scoreboard {
  id: string;
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
      awayTeam: {
        score: number;
      };
      homeTeam: {
        score: number;
      };
    }>;
  };
}

function idFromCode(code: string): string {
  return 's' + code.replace('/', '').toLowerCase();
}

function parseScoreboards(rawData: NBAScoreboardResponse): Scoreboard[] {
  const todaysScoreboards = rawData.scoreboard.games;
  return todaysScoreboards.map((game) => ({
    id: idFromCode(game.gameCode),
    code: game.gameCode,
    status: game.gameStatus,
    status_text: game.gameStatusText,
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
          await pb.collection('scoreboards').create(scoreboard);
          return { action: 'CREATED', id: scoreboard.id };
        } catch (error) {
          console.log('error', error);
          try {
            await pb
              .collection('scoreboards')
              .update(scoreboard.id, scoreboard);
            return { action: 'UPDATED', id: scoreboard.id };
          } catch (updateError) {
            return {
              action: 'FAILED',
              scoreboard: scoreboard,
              error: updateError.message,
            };
          }
        }
      })
    );

    const createdCount = results.filter((r) => r.action === 'CREATED').length;
    const updatedCount = results.filter((r) => r.action === 'UPDATED').length;
    const failed = results.filter((r) => r.action === 'FAILED');
    const failedCount = failed.length;

    console.log('failed', failed);

    return new Response(
      JSON.stringify({
        message: 'Scoreboards updated successfully',
        stats: {
          created: createdCount,
          updated: updatedCount,
          failed: failedCount,
        },
      }),
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
