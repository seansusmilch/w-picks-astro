import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { expandAvatarUrl } from '@/lib/data_common';
import { Leaderboard } from '@/components/Stats/Leaderboard';
import { getAllStats } from '@/lib/stats';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Leaderboard - All Time',
};

export default async function StatsPage() {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');
  
  if (!pbAuth) {
    redirect('/login');
  }

  const user = await getUser(pbAuth.value);
  if (!user) {
    redirect('/login');
  }

  const data = expandAvatarUrl(await getAllStats());

  return (
    <div className="p-2 lg:p-4 max-w-[1400px] pb-10">
      <h1 className="text-3xl py-6 font-bold">Leaderboard - All Time</h1>
      <div className="flex flex-col items-center gap-4">
        <Leaderboard data={data} />
        <Link href="/stats/weekly">
          <Button>View Weekly Leaderboard</Button>
        </Link>
      </div>
    </div>
  );
}
