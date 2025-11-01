import { redirect } from 'next/navigation';
import { getWeekListAction } from '@/app/actions/stats';

export default async function WeeklyLeaderboardPage() {
  const { data: weekList } = await getWeekListAction();

  if (!weekList || weekList.length === 0) {
    // If no weeks available, redirect to all-time leaderboard
    redirect('/leaderboard');
  }

  // Redirect to the most recent week
  redirect(`/leaderboard/weekly/${weekList[0]}`);
}

