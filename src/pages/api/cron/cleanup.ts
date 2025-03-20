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
import { DateTime } from 'luxon';

async function attachAllExistingMatchupsToScoreboards() {
  const pb = getAPB();
  const scoreboards = await pb
    .collection('scoreboards')
    .getFullList({ batch: 10000 });

  for (const scoreboard of scoreboards) {
    await attachMatchupToScoreboard(scoreboard.id, scoreboard.code);
  }
}

async function deleteUsersWithoutVerification() {
  const pb = getAPB();
  const unverifiedUsers = await pb.collection('users').getFullList({
    filter: pb.filter('verified = false && created < {:created}', {
      created: DateTime.now().minus({ days: 7 }).toJSDate(),
    }),
  });

  for (const user of unverifiedUsers) {
    console.log('Deleting user', user.id);
    await pb.collection('users').delete(user.id);
  }
}
