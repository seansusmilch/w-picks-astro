import { Suspense } from 'react';
import { getAllStatsAction } from '@/app/actions/stats';
import { getAuthenticatedUser } from '@/lib/pocketbase-server';
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import type { Metadata } from 'next';
import { LeaderboardSkeleton } from '@/components/leaderboard/leaderboard-skeleton';

export const metadata: Metadata = {
  title: 'Leaderboard - All Time | Baller Picks',
  description: 'View the all-time leaderboard showing top performers by win percentage',
};

async function LeaderboardContent() {
  const user = await getAuthenticatedUser();
  const { data: stats, error } = await getAllStatsAction();

  if (error || !stats) {
    return (
      <div className="w-full text-center py-8 text-muted-foreground">
        <p className="text-base font-medium">Failed to load leaderboard</p>
        <p className="text-xs mt-1">{error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  return (
    <LeaderboardTable data={stats} currentUserId={user?.record.id} />
  );
}

export default async function LeaderboardPage() {
  return (
    <div className="container mx-auto p-4 py-4 max-w-6xl">
      <div className="mb-3 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h1 className="text-xl sm:text-2xl font-bold">All-Time Leaderboard</h1>
      </div>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <Suspense fallback={<LeaderboardSkeleton />}>
            <LeaderboardContent />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

