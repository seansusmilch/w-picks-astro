/**
 * This is a cron job that will cleanup the database.
 *
 * 1. Ensure every scoreboard has a corresponding matchup
 * 2. Retroactively fetch scoreboard data for past matchups without scoreboards
 * 3. Update "left behind" picks to have correct status
 * 4. Delete users who haven't verified their email in the last 7 days
 * 5. Delete left behind picks
 */

import { getAPB } from '@/lib/data';
import { attachMatchupToScoreboard } from '@/lib/scoreboards';
import { getLogger } from '@/lib/logger';
import type { APIRoute } from 'astro';
import { DateTime } from 'luxon';
import {
  trackPerformance,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/cron-utils';

// Create a named logger for this file
const logger = getLogger('cleanup');

async function attachAllExistingMatchupsToScoreboards() {
  const pb = getAPB();
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
  const pb = getAPB();

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
  const pb = getAPB();

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

export const POST: APIRoute = async ({ request }) => {
  const jobStartTime = performance.now();
  const startTime = DateTime.now().toISO();

  logger.info({ startTime }, 'Starting cleanup cron job');

  const stats = {
    picksUpdated: { total: 0, success: 0, errors: 0 },
    scoreboardsProcessed: { total: 0, success: 0, errors: 0 },
    usersDeleted: { total: 0, success: 0, errors: 0 },
    startTime,
  };

  try {
    // Run with performance tracking
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

    stats.usersDeleted = await trackPerformance(
      'deleteUsersWithoutVerification',
      async () => deleteUsersWithoutVerification(),
      logger
    );

    // Log completion with full stats
    const jobDurationMs = performance.now() - jobStartTime;
    logger.info(
      {
        durationMs: jobDurationMs.toFixed(2),
        ...stats,
      },
      `Cleanup cron job completed in ${jobDurationMs.toFixed(2)}ms`
    );

    return createSuccessResponse(
      'Cleanup completed successfully',
      jobStartTime,
      { stats }
    );
  } catch (error) {
    return createErrorResponse(error, jobStartTime, {
      stats,
      jobType: 'cleanup',
    });
  }
};
