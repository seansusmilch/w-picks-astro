import { NextRequest, NextResponse } from 'next/server';
import { getAPB } from '@/lib/data';
import { attachMatchupToScoreboard } from '@/lib/scoreboards';
import { getLogger } from '@/lib/logger';
import { DateTime } from 'luxon';
import {
  trackPerformance,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/cron-utils';
import { updateScoreboard } from '@/lib/scoreboards';
import { updatePicksStatus } from '@/lib/picks';
import { fetchNBAScheduleEndpoint } from '@/lib/nba';

const logger = getLogger('cleanup');

async function attachAllExistingMatchupsToScoreboards() {
  const pb = await getAPB();
  const fetchStart = performance.now();
  const scoreboards = await pb
    .collection('scoreboards')
    .getFullList({ batch: 10000 });
  const fetchEnd = performance.now();

  logger.info(
    {
      count: scoreboards.length,
      fetchDurationMs: (fetchEnd - fetchStart).toFixed(2),
    },
    `Fetched ${scoreboards.length} scoreboards for attaching matchups`
  );

  let successCount = 0;
  let errorCount = 0;

  const attachStart = performance.now();
  for (const scoreboard of scoreboards) {
    try {
      await attachMatchupToScoreboard(scoreboard.id, scoreboard.code);
      successCount++;
    } catch (error) {
      errorCount++;
      logger.error(
        {
          scoreboardId: scoreboard.id,
          code: scoreboard.code,
          error,
        },
        'Error attaching matchup to scoreboard'
      );
    }
  }
  const attachEnd = performance.now();

  logger.info(
    {
      totalCount: scoreboards.length,
      successCount,
      errorCount,
      durationMs: (attachEnd - attachStart).toFixed(2),
    },
    `Completed attaching matchups to scoreboards`
  );

  return {
    total: scoreboards.length,
    success: successCount,
    errors: errorCount,
  };
}

async function deleteUsersWithoutVerification() {
  const pb = await getAPB();

  const fetchStart = performance.now();
  const unverifiedUsers = await pb.collection('users').getFullList({
    filter: pb.filter('verified = false && created < {:created}', {
      created: DateTime.now().minus({ days: 7 }).toJSDate(),
    }),
  });
  const fetchEnd = performance.now();

  logger.info(
    {
      count: unverifiedUsers.length,
      fetchDurationMs: (fetchEnd - fetchStart).toFixed(2),
    },
    `Found ${unverifiedUsers.length} unverified users to delete`
  );

  let successCount = 0;
  let errorCount = 0;

  const deleteStart = performance.now();
  for (const user of unverifiedUsers) {
    try {
      logger.debug({ userId: user.id }, 'Deleting user');
      await pb.collection('users').delete(user.id);
      successCount++;
    } catch (error) {
      errorCount++;
      logger.error(
        { userId: user.id, error },
        'Error deleting unverified user'
      );
    }
  }
  const deleteEnd = performance.now();

  logger.info(
    {
      totalCount: unverifiedUsers.length,
      successCount,
      errorCount,
      durationMs: (deleteEnd - deleteStart).toFixed(2),
    },
    `Completed deleting unverified users`
  );

  return {
    total: unverifiedUsers.length,
    success: successCount,
    errors: errorCount,
  };
}

async function updateLeftBehindPicks() {
  const pb = await getAPB();

  const fetchStart = performance.now();
  const leftBehindPicks = await pb.collection('picks').getFullList({
    filter: pb.filter('status = "upcoming" && matchup.time_utc < {:now}', {
      now: DateTime.now().minus({ days: 1 }).toJSDate(),
    }),
  });
  const fetchEnd = performance.now();

  logger.info(
    {
      count: leftBehindPicks.length,
      fetchDurationMs: (fetchEnd - fetchStart).toFixed(2),
    },
    `Found ${leftBehindPicks.length} left behind picks to update`
  );

  let successCount = 0;
  let errorCount = 0;

  const updateStart = performance.now();
  for (const pick of leftBehindPicks) {
    try {
      logger.debug(
        { pickId: pick.id, matchupId: pick.matchup },
        'Updating pick to past status'
      );
      await pb.collection('picks').update(pick.id, { status: 'past' });
      successCount++;
    } catch (error) {
      errorCount++;
      logger.error(
        { pickId: pick.id, matchupId: pick.matchup, error },
        'Error updating pick to past status'
      );
    }
  }
  const updateEnd = performance.now();

  logger.info(
    {
      totalCount: leftBehindPicks.length,
      successCount,
      errorCount,
      durationMs: (updateEnd - updateStart).toFixed(2),
    },
    `Completed updating left behind picks`
  );

  return {
    total: leftBehindPicks.length,
    success: successCount,
    errors: errorCount,
  };
}

async function retroactivelyFetchScoreboards() {
  logger.info('Starting to fetch historical scoreboards');

  const fetchStart = performance.now();
  const data = await fetchNBAScheduleEndpoint();
  const fetchEnd = performance.now();

  logger.info(
    { durationMs: (fetchEnd - fetchStart).toFixed(2) },
    'NBA historical data fetch completed'
  );

  const games: any[] = [];
  const gameDates = data.leagueSchedule?.gameDates || [];

  for (const gameDate of gameDates) {
    if (!gameDate.games) continue;

    for (const game of gameDate.games) {
      if (game.gameStatus === 3) {
        games.push({
          code: game.gameCode,
          status: game.gameStatus,
          status_text: game.gameStatusText,
          away_score: game.awayTeam.score,
          home_score: game.homeTeam.score,
        });
      }
    }
  }

  logger.info({ count: games.length }, 'Found completed games to process');

  const updateStart = performance.now();
  const scoreBoardUpdatePromises = games.map(async (scoreboard) => {
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

  logger.info(
    {
      created: createdCount,
      updated: updatedCount,
      failed: failedCount,
      durationMs: (updateEnd - updateStart).toFixed(2),
    },
    'Historical scoreboard update completed'
  );

  if (failedCount > 0) {
    logger.warn({ failed }, 'Some historical scoreboard updates failed');
  }

  return {
    total: games.length,
    created: createdCount,
    updated: updatedCount,
    failed: failedCount,
  };
}

export async function POST(request: NextRequest) {
  const jobStartTime = performance.now();
  const startTime = DateTime.now().toISO();

  logger.info({ startTime }, 'Starting cleanup cron job');

  const stats = {
    picksUpdated: { total: 0, success: 0, errors: 0 },
    scoreboardsProcessed: { total: 0, success: 0, errors: 0 },
    usersDeleted: { total: 0, success: 0, errors: 0 },
    historicalScoreboards: { total: 0, created: 0, updated: 0, failed: 0 },
    startTime,
  };

  try {
    stats.picksUpdated = await trackPerformance(
      'updateLeftBehindPicks',
      async () => updateLeftBehindPicks(),
      logger
    );

    stats.scoreboardsProcessed = await trackPerformance(
      'attachAllExistingMatchupsToScoreboards',
      async () => attachAllExistingMatchupsToScoreboards(),
      logger
    );

    stats.historicalScoreboards = await trackPerformance(
      'retroactivelyFetchScoreboards',
      async () => retroactivelyFetchScoreboards(),
      logger
    );

    stats.usersDeleted = await trackPerformance(
      'deleteUsersWithoutVerification',
      async () => deleteUsersWithoutVerification(),
      logger
    );

    const jobDurationMs = performance.now() - jobStartTime;
    logger.info(
      {
        durationMs: jobDurationMs.toFixed(2),
        ...stats,
      },
      `Cleanup cron job completed in ${jobDurationMs.toFixed(2)}ms`
    );

    const response = createSuccessResponse(
      'Cleanup completed successfully',
      jobStartTime,
      { stats }
    );
    return NextResponse.json(response.body, { status: response.status });
  } catch (error: any) {
    const response = createErrorResponse(error, jobStartTime, {
      stats,
      jobType: 'cleanup',
    });
    return NextResponse.json(response.body, { status: response.status });
  }
}
