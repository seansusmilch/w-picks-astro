import { getAPB } from '@/lib/data';
import { type APIRoute } from 'astro';
import moment from 'moment';

const PAST_CUTOFF = 3;
const FUTURE_CUTOFF = 90;
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
  id: string;
  code: string;
  time_utc: string;
  away_code: string;
  home_code: string;
}

function idFromCode(code: string): string {
  return code.replace('/', '-');
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
    id: idFromCode(game.gameCode),
    code: game.gameCode,
    time_utc: game.gameDateTimeUTC,
    away_code: game.awayTeam.teamTricode,
    home_code: game.homeTeam.teamTricode,
  }));
}

export const POST: APIRoute = async () => {
  try {
    const pb = await getAPB();

    const response = await fetch(NBA_SCHEDULE_URL);
    const matchupsJson = await response.json();
    const matchups = parseMatchups(matchupsJson);

    const results = await Promise.all(
      matchups.map((matchup) =>
        pb
          .collection('matchups')
          .create(matchup, { requestKey: matchup.id })
          .then(() => ({ id: matchup.id, action: 'CREATED' }))
          .catch(() =>
            pb
              .collection('matchups')
              .update(matchup.id, matchup, { requestKey: matchup.id })
          )
          .then(() => ({ id: matchup.id, action: 'UPDATED' }))
          .catch((err) => ({ matchup, action: 'FAILED', error: err }))
      )
    );

    const createdCount = results.filter(
      (result) => result.action === 'CREATED'
    ).length;
    const updatedCount = results.filter(
      (result) => result.action === 'UPDATED'
    ).length;
    const failed = results.filter((result) => result.action === 'FAILED');
    console.log('failed', failed);
    const failedCount = failed.length;

    return new Response(
      JSON.stringify({
        createdCount,
        updatedCount,
        failedCount,
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
