import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { expandAvatarUrl } from '@/lib/data_common';
import {
  WeeklyStatsView,
  WeeklyStatsViewSkeleton,
} from '@/components/Views/WeeklyStatsView';
import {
  LatestPicksView,
  LatestPicksViewSkeleton,
} from '@/components/Picks/LatestPicksView';
import { getWeeklyStats, getWeekList } from '@/lib/stats';
import { getLatestPicks } from '@/lib/picks';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Leaderboard - Weekly',
};

export default async function WeeklyStatsPage() {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');
  
  if (!pbAuth) {
    redirect('/login');
  }

  const user = await getUser(pbAuth.value);
  if (!user) {
    redirect('/login');
  }

  const hideFromLatestPicks = user.record.settings?.hideFromLatestPicks;
  const { picks: latestPicks, users: latestUsers } = await getLatestPicks(
    10,
    hideFromLatestPicks ? user.record.id : undefined
  );

  const weekList = await getWeekList();
  const initialWeek = weekList[0];
  const initialData = expandAvatarUrl(await getWeeklyStats(initialWeek));

  return (
    <div className="p-2 lg:p-4 max-w-[1400px] pb-10">
      <div className="px-2 pt-4 sm:pt-6 flex flex-col items-center gap-4 sm:gap-8">
        <div className="w-full max-w-xl">
          <h2 className="text-xl sm:text-2xl font-bold mb-3">Latest Picks</h2>
          <LatestPicksView picks={latestPicks} users={latestUsers}>
            <LatestPicksViewSkeleton />
          </LatestPicksView>
        </div>

        <div className="w-full max-w-2xl flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Weekly Leaderboard</h2>
          <WeeklyStatsView
            initialData={initialData}
            initialWeek={initialWeek}
            weekList={weekList}
          >
            <WeeklyStatsViewSkeleton />
          </WeeklyStatsView>
        </div>
      </div>
    </div>
  );
}
