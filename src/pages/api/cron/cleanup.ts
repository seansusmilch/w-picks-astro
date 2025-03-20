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

// Create a named logger for this file
const logger = getLogger('cleanup');

async function attachAllExistingMatchupsToScoreboards() {
  const pb = getAPB();
  const scoreboards = await pb
    .collection('scoreboards')
    .getFullList({ batch: 10000 });

  logger.info(`Attaching matchups to ${scoreboards.length} scoreboards`);
  for (const scoreboard of scoreboards) {
    await attachMatchupToScoreboard(scoreboard.id, scoreboard.code);
  }

  return scoreboards.length;
}

async function deleteUsersWithoutVerification() {
  const pb = getAPB();
  const unverifiedUsers = await pb.collection('users').getFullList({
    filter: pb.filter('verified = false && created < {:created}', {
      created: DateTime.now().minus({ days: 7 }).toJSDate(),
    }),
  });

  logger.info(`Deleting ${unverifiedUsers.length} unverified users`);
  for (const user of unverifiedUsers) {
    logger.debug({ userId: user.id }, 'Deleting user');
    await pb.collection('users').delete(user.id);
  }

  return unverifiedUsers.length;
}

async function updateLeftBehindPicks() {
  const pb = getAPB();
  const leftBehindPicks = await pb.collection('picks').getFullList({
    filter: pb.filter('status = "upcoming" && matchup.time_utc < {:now}', {
      now: DateTime.now().minus({ days: 1 }).toJSDate(),
    }),
  });

  logger.info(
    `Updating ${leftBehindPicks.length} left behind picks to 'past' status`
  );
  for (const pick of leftBehindPicks) {
    logger.debug(
      { pickId: pick.id, matchupId: pick.matchup },
      'Updating pick to past status'
    );
    await pb.collection('picks').update(pick.id, { status: 'past' });
  }

  return leftBehindPicks.length;
}

export const POST: APIRoute = async ({ request }) => {
  logger.info('Starting cleanup cron job');
  const stats = {
    picksUpdated: 0,
    scoreboardsProcessed: 0,
    usersDeleted: 0,
    timestamp: DateTime.now().toISO(),
  };

  try {
    logger.info('Running left behind picks update');
    stats.picksUpdated = await updateLeftBehindPicks();

    logger.info('Running scoreboard-matchup attachments');
    stats.scoreboardsProcessed = await attachAllExistingMatchupsToScoreboards();

    logger.info('Running unverified user cleanup');
    stats.usersDeleted = await deleteUsersWithoutVerification();

    logger.info('Cleanup cron job completed successfully');
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cleanup completed successfully',
        stats,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    logger.error({ error }, 'Error during cleanup cron job');
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error during cleanup',
        stats,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
