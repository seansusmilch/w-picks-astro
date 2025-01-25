import { getAPB } from '@/lib/data';
import { type APIRoute } from 'astro';
import moment from 'moment';
import { CRON_SECRET } from 'astro:env/server';
import { getMatchupByCode } from '@/lib/matchups';

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

function parseMatchups(rawData: ScheduleResponse): Matchup[] {
  const pastCutoff = moment().subtract(PAST_CUTOFF, 'days');
  const futureCutoff = moment().add(FUTURE_CUTOFF, 'days');

  const filteredDates = rawData.leagueSchedule.gameDates.filter((date) => {
    const gameDate = moment(date.gameDate);
    return gameDate.isAfter(pastCutoff) && gameDate.isBefore(futureCutoff);
  });

  const allGames = filteredDates.flatMap((date) => date.games);
  console.log('allGames', allGames.length);
  return allGames.map((game) => ({
    code: game.gameCode,
    time_utc: game.gameDateTimeUTC,
    away_code: game.awayTeam.teamTricode,
    home_code: game.homeTeam.teamTricode,
  }));
}

export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get('Cron-Secret') !== CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const pb = await getAPB();

    const response = await fetch(NBA_SCHEDULE_URL);
    const matchupsJson = await response.json();
    const matchups = parseMatchups(matchupsJson);

    const results = [];
    for (const matchup of matchups) {
      try {
        const existingMatchup = await getMatchupByCode(matchup.code);
        if (existingMatchup) {
          const newRecord = await pb
            .collection('matchups')
            .update(existingMatchup.id, matchup, {
              requestKey: Date.now().toString(),
            });
          results.push({ id: newRecord.id, action: 'UPDATED' });
          continue;
        }

        const newRecord = await pb.collection('matchups').create(matchup, {
          requestKey: Date.now().toString(),
        });
        results.push({ id: newRecord.id, action: 'CREATED' });
      } catch (error) {
        console.error('Error updating matchup:', error);
        results.push({
          matchup: matchup,
          action: 'FAILED',
          error: error.message,
        });
      }
    }

    const createdCount = results.filter((r) => r.action === 'CREATED').length;
    const updatedCount = results.filter((r) => r.action === 'UPDATED').length;
    const failed = results.filter((r) => r.action === 'FAILED');
    console.log('failed', failed);
    const failedCount = failed.length;

    return new Response(
      JSON.stringify({
        message: 'Update matchups job completed',
        stats: {
          created: createdCount,
          updated: updatedCount,
          failed: failedCount,
        },
        results: results,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error updating matchups:', error);
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
