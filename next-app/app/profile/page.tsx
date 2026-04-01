import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/pocketbase-server';
import { getStatsByUserId } from '@/lib/stats';
import { getUserAvatarUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ProfileEditWrapper } from '@/components/profile/profile-edit-wrapper';
import { AllTimeStatsCard } from '@/components/profile/all-time-stats-card';
import { UserPicksTable } from '@/components/profile/user-picks-table';
import { Settings } from 'lucide-react';
import { getPicksByUser } from '@/app/actions/users';
import Link from 'next/link';

export default async function ProfilePage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect('/login');
  }

  const stats = await getStatsByUserId(user.record.id);
  const picks = await getPicksByUser(user.record.id);
  const avatarUrl = getUserAvatarUrl(user.record.id, user.record.avatar);

  const hasLive = picks.some((p) => p.status === 'live');
  const hasUpcoming = picks.some((p) => p.status === 'upcoming');
  const defaultTab = hasLive ? 'live' : hasUpcoming ? 'upcoming' : 'past';

  return (
    <div className="container mx-auto p-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Link href="/profile/settings">
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>

      <ProfileEditWrapper
        avatarUrl={avatarUrl}
        username={user.record.username}
        bio={user.record.bio}
      />

      <AllTimeStatsCard stats={stats} />

      <UserPicksTable picks={picks} defaultTab={defaultTab} />
    </div>
  );
}
