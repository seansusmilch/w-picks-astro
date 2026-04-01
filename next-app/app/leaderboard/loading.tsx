import { LeaderboardSkeleton } from '@/components/leaderboard/leaderboard-skeleton';

export default function LeaderboardLoading() {
  return (
    <div className="container mx-auto p-4 py-6 sm:py-8 max-w-6xl">
      <LeaderboardSkeleton />
    </div>
  );
}

