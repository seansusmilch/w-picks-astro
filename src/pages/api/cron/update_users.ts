import type { APIRoute } from 'astro';
import { getAPB } from '@/lib/data';
import { CRON_SECRET } from 'astro:env/server';
import { getStatsByUserId } from '@/lib/stats';
import { getPicksByUser } from '@/lib/picks';

interface UserStats {
  total_picks: number;
  win_picks: number;
  lose_picks: number;
  win_loss_ratio: number;
  win_pick_rate: number;
}

async function attachStatsToUser(userId: string, statsId) {
  const pb = getAPB();

  await pb.collection('users').update(userId, {
    stats: statsId,
  });
}

async function updateStats(userId: string) {
  const pb = getAPB();
  try {
    const pastPicks = await getPicksByUser(userId, 'past');

    const winPicks = pastPicks.filter((p: any) => p.result === 'W');
    const losePicks = pastPicks.filter((p: any) => p.result === 'L');
    const totalPicks = pastPicks.length;

    const winLossRatio = losePicks.length
      ? winPicks.length / losePicks.length
      : winPicks.length;
    const winPickRate = totalPicks
      ? Math.round((winPicks.length / totalPicks) * 100)
      : 0;

    const latestStats: UserStats = {
      total_picks: totalPicks,
      win_picks: winPicks.length,
      lose_picks: losePicks.length,
      win_loss_ratio: winLossRatio,
      win_pick_rate: winPickRate,
    };

    // Get or create stats record
    const statsRecord = await getStatsByUserId(userId);
    if (statsRecord) {
      await pb.collection('stats').update(statsRecord.id, {
        user: userId,
        ...latestStats,
      });
      return { action: 'UPDATED', userId };
    }

    const newStatsRecord = await pb.collection('stats').create(latestStats);
    await attachStatsToUser(userId, newStatsRecord.id);

    return { action: 'CREATED', userId };
  } catch (error) {
    console.error('Error updating stats for user', userId, error);
    return { action: 'FAILED', userId, error: error.message };
  }
}

export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get('Cron-Secret') !== CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const startTime = Date.now();
    const pb = getAPB();

    const users = await pb.collection('users').getFullList();
    const results = [];

    for (const user of users) {
      const res = await updateStats(user.id);
      results.push(res);
    }

    const createdCount = results.filter((r) => r.action === 'CREATED').length;
    const updatedCount = results.filter((r) => r.action === 'UPDATED').length;
    const failed = results.filter((r) => r.action === 'FAILED');
    const failedCount = failed.length;

    const duration = (Date.now() - startTime) / 1000;

    return new Response(
      JSON.stringify(
        {
          message: 'Update users job completed',
          duration: `${duration.toFixed(2)} seconds`,
          stats: {
            created: createdCount,
            updated: updatedCount,
            failed: failedCount,
          },
          results,
        },
        null,
        2
      ),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error updating users:', error);
    return new Response(JSON.stringify({ error: 'Failed to update users' }), {
      status: 500,
    });
  }
};
