import { getGamesByCodePrefix } from '@/app/actions/matchups';
import { getTodayCodePrefix } from '@/lib/date-utils';
import { GamesView } from '@/components/weekly/games-view';
import { Card, CardContent } from '@/components/ui/card';
import { getLatestPicks } from '@/app/actions/picks';
import { getAuthenticatedUser } from '@/lib/pocketbase-server';
import { LatestPicksView } from '@/components/weekly/latest-picks-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Weekly Matchups | Baller Picks',
  description: 'View NBA matchups for the week',
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const initialDateCode = date || getTodayCodePrefix();
  const initialGames = await getGamesByCodePrefix(initialDateCode);

  const authUser = await getAuthenticatedUser();
  const { picks: latestPicks, users: latestPicksUsers } =
    await getLatestPicks(10, authUser?.record.id);

  return (
    <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-4 max-w-6xl">
      {latestPicks.length > 0 && (
        <LatestPicksView picks={latestPicks} users={latestPicksUsers} />
      )}
      <Card>
        <CardContent className="p-0">
          <GamesView
            initialDateCode={initialDateCode}
            initialGames={initialGames}
          />
        </CardContent>
      </Card>
    </div>
  );
}
