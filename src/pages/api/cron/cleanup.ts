/**
 * This is a cron job that will cleanup the database.
 *
 * 1. Ensure every scoreboard has a corresponding matchup
 * 2. Retroactively fetch scoreboard data for past matchups without scoreboards
 * 3. Update "left behind" picks to have correct status
 * 4. Delete users who haven't verified their email in the last 30 days
 */

import { getAPB } from '@/lib/data';
import { attachMatchupToScoreboard } from '@/lib/scoreboards';

async function attachAllExistingMatchupsToScoreboards() {
  const pb = getAPB();
  const scoreboards = await pb
    .collection('scoreboards')
    .getFullList({ batch: 10000 });

  for (const scoreboard of scoreboards) {
    await attachMatchupToScoreboard(scoreboard.id, scoreboard.code);
  }
}
