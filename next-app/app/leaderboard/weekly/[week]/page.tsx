import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getWeeklyStatsAction, getWeekListAction } from '@/app/actions/stats';
import { getAuthenticatedUser } from '@/lib/pocketbase-server';
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table';
import { WeeklySelector } from '@/components/leaderboard/weekly-selector';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import type { Metadata } from 'next';
import { LeaderboardSkeleton } from '@/components/leaderboard/leaderboard-skeleton';
import { WeeklyStatZ } from '@/lib/definitions';

interface WeeklyLeaderboardPageProps {
  params: Promise<{ week: string }>;
}

async function WeeklyLeaderboardContent({ week }: { week: string }) {
  const user = await getAuthenticatedUser();
  const { data: stats, error } = await getWeeklyStatsAction(week);

  if (error || !stats) {
    return (
      <div className="w-full text-center py-8 text-muted-foreground">
        <p className="text-base font-medium">Failed to load weekly leaderboard</p>
        <p className="text-xs mt-1">{error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  return (
    <LeaderboardTable data={stats} currentUserId={user?.record.id} />
  );
}

export async function generateMetadata({
  params,
}: WeeklyLeaderboardPageProps): Promise<Metadata> {
  const { week } = await params;
  return {
    title: `Weekly Leaderboard - ${week} | Baller Picks`,
    description: `View the weekly leaderboard for ${week}`,
  };
}

export default async function WeeklyLeaderboardPage({ params }: WeeklyLeaderboardPageProps) {
  const { week } = await params;

  // Validate week format
  const weekValidation = WeeklyStatZ.shape.year_week.safeParse(week);
  if (!weekValidation.success) {
    notFound();
  }

  const { data: weekList } = await getWeekListAction();
  const isValidWeek = weekList?.includes(week);

  if (!isValidWeek) {
    notFound();
  }

  const selectedWeek = week;

  return (
    <div className="container mx-auto p-4 py-4 max-w-6xl">
      <div className="mb-3 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h1 className="text-xl sm:text-2xl font-bold">Weekly Leaderboard</h1>
      </div>

      <Card className="mb-2">
        <CardContent className="p-3">
          {weekList && weekList.length > 0 && (
            <WeeklySelector selectedWeek={selectedWeek} weekList={weekList} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <Suspense fallback={<LeaderboardSkeleton />}>
            <WeeklyLeaderboardContent week={selectedWeek} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

