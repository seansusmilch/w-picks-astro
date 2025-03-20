import { getAPB } from '@/lib/data';
import { type APIRoute } from 'astro';
import { DateTime } from 'luxon';
import { CRON_SECRET } from 'astro:env/server';
import { getMatchupByCode } from '@/lib/matchups';
import type { MatchupType } from '@/lib/definitions';

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
      console.log(`Failed to parse gameDate ${date.gameDate}`);
      return false;
    }

    return gameDate > pastCutoff && gameDate < futureCutoff;
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

async function findMatchupsToDelete(
  matchups: Matchup[]
): Promise<MatchupType[]> {
  const pb = getAPB();
  // Get existing future matchups from our database
  const existingFutureMatchups = await pb
    .collection<MatchupType>('matchups')
    .getFullList({
      filter: pb.filter('time_utc > {:now}', { now: new Date() }),
      batch: 2000,
    });

  console.log(
    `Found ${existingFutureMatchups.length} existing future matchups in database`
  );

  // Extract game codes from the API future matchups
  const apiGameCodes = new Set(matchups.map((game) => game.code));
  console.log(`Found ${apiGameCodes.size} game codes from NBA API`);

  // Find matchups that don't exist in the NBA API data anymore
  const matchupsToDelete = existingFutureMatchups.filter(
    (matchup) => !apiGameCodes.has(matchup.code)
  );

  // Log matchups to delete
  if (matchupsToDelete.length > 0) {
    console.log(`\nFound ${matchupsToDelete.length} matchups to delete.`);
    matchupsToDelete.forEach((matchup, index) => {
      console.log(
        `${index + 1}. ${matchup.id}: ${matchup.away_code} @ ${
          matchup.home_code
        } (${matchup.time_utc})`
      );
    });
  } else {
    console.log('No matchups need to be deleted.');
  }

  return matchupsToDelete;
}

async function processMatchups(
  matchups: Matchup[]
): Promise<OperationResult[]> {
  const pb = getAPB();
  const results: OperationResult[] = [];

  for (const matchup of matchups) {
    // Skip matchups without codes
    if (!matchup.code) {
      console.log('No code for matchup', matchup);
      results.push({
        matchup,
        action: 'SKIPPED',
        reason: 'Missing game code',
      });
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
      } else {
        // Create new matchup
        const newRecord = await pb
          .collection<MatchupType>('matchups')
          .create(matchup);

        results.push({
          id: newRecord.id,
          action: 'CREATED',
        });
      }
    } catch (error) {
      console.error('Error processing matchup:', error);
      results.push({
        matchup,
        action: 'FAILED',
        error: error.message,
      });
    }
  }

  return results;
}

async function deleteMatchups(
  matchupsToDelete: MatchupType[]
): Promise<OperationResult[]> {
  const pb = getAPB();
  const results: OperationResult[] = [];

  for (const matchup of matchupsToDelete) {
    try {
      // Uncomment to actually delete
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
      console.error(`Error deleting matchup ${matchup.id}:`, error);
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

export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get('Cron-Secret') !== CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const pb = await getAPB();
    const response = await fetch(NBA_SCHEDULE_URL);
    const matchupsJson = await response.json();
    const matchups = parseMatchups(matchupsJson);
    if (matchups.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'No matchups found. Possibly upstream API error',
          matchupResponse: matchupsJson,
        }),
        { status: 200 }
      );
    }

    // Find matchups to delete and process operations
    const matchupsToDelete = await findMatchupsToDelete(matchups);
    const results = await processMatchups(matchups);
    const deleteResults = await deleteMatchups(matchupsToDelete);

    // Combine all results
    const allResults = [...results, ...deleteResults];
    const stats = generateStats(allResults);

    // Log failures
    const failures = allResults.filter(
      (r) => r.action === 'FAILED' || r.action === 'DELETE_FAILED'
    );
    if (failures.length > 0) {
      console.log('Failed operations:', failures);
    }

    // Return response
    return new Response(
      JSON.stringify(
        {
          message: 'Update matchups job completed',
          stats,
          results: allResults,
        },
        null,
        2
      ),
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
