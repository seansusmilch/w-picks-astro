import type { APIRoute } from 'astro';
import { getAPB } from '@/lib/data';
import { CRON_SECRET } from 'astro:env/server';

interface UserStats {
  total_picks: number;
  win_picks: number;
  lose_picks: number;
  win_loss_ratio: number;
  win_pick_rate: number;
}

async function updateStats(pb: any, userId: string) {
  try {
    // Get past picks for user
    const pastPicks = await pb.collection('picks').getList(1, 1000, {
      filter: `user="${userId}" && status="past"`,
    });

    const winPicks = pastPicks.items.filter((p: any) => p.result === 'W');
    const losePicks = pastPicks.items.filter((p: any) => p.result === 'L');
    const totalPicks = pastPicks.totalItems;

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
    const statsRecord = await pb
      .collection('stats')
      .getFirstListItem(`user="${userId}"`);

    if (!statsRecord) {
      const newStats = await pb.collection('stats').create({
        user: userId,
        ...latestStats,
      });
      await pb.collection('users').update(userId, { stats: newStats.id });
      console.log('Created stats for user', userId);
      return { action: 'CREATED', userId };
    }

    await pb.collection('stats').update(statsRecord.id, latestStats);
    console.log('Updated stats for user', userId);
    return { action: 'UPDATED', userId };
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

    // Get all users with pagination
    const perPage = 10;
    let page = 1;
    let results: any[] = [];

    while (true) {
      const usersPage = await pb.collection('users').getList(page, perPage);

      const pageResults = await Promise.all(
        usersPage.items.map((user) => updateStats(pb, user.id))
      );

      results.push(...pageResults);

      if (page >= usersPage.totalPages) break;
      page++;
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
