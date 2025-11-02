import { getGamesByCodePrefix } from '@/app/actions/matchups';
import { getTodayCodePrefix } from '@/lib/date-utils';
import { WeekGamesView } from '@/components/weekly/week-games-view';
import { Card, CardContent } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Weekly Matchups | Baller Picks',
  description: 'View NBA matchups for the week',
};

export default async function HomePage() {
  // Await everything before rendering - loading.tsx will show spinner until this completes
  const todayCodePrefix = getTodayCodePrefix();
  const initialGames = await getGamesByCodePrefix(todayCodePrefix);

  return (
    <div className='container mx-auto px-0 sm:px-4 py-4 max-w-6xl'>
      <Card>
        <CardContent className='p-0'>
          <WeekGamesView
            initialDateCode={todayCodePrefix}
            initialGames={initialGames}
          />
        </CardContent>
      </Card>
    </div>
  );
}
