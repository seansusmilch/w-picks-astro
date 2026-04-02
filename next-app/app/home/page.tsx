import { getLatestPicks } from '@/app/actions/picks';
import { getAuthenticatedUser } from '@/lib/pocketbase-server';
import { LatestPicksView } from '@/components/weekly/latest-picks-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Latest Picks | Baller Picks',
  description: 'See the latest picks from the community',
};

export default async function HomePage() {
  const authUser = await getAuthenticatedUser();
  const { picks: latestPicks, users: latestPicksUsers } =
    await getLatestPicks(20, authUser?.record.id);

  return (
    <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-4 max-w-2xl">
      <LatestPicksView picks={latestPicks} users={latestPicksUsers} />
    </div>
  );
}
