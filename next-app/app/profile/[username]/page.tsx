import { notFound, redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/pocketbase-server';
import { getUserByUsername } from '@/app/actions/users';
import { getStatsByUserId, getUserAvatarUrl } from '@/lib/stats';
import { ProfileHeader } from '@/components/profile/profile-header';
import { AllTimeStatsCard } from '@/components/profile/all-time-stats-card';

export const dynamic = 'force-dynamic';

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const viewer = await getAuthenticatedUser();
  if (!viewer) redirect('/login');

  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) notFound();

  const stats = await getStatsByUserId(user.id);
  const avatarUrl = getUserAvatarUrl(user.id, user.avatar);

  return (
    <div className="container mx-auto p-4 py-8 max-w-4xl">
      <ProfileHeader
        avatarUrl={avatarUrl}
        username={user.username}
        bio={user.bio}
      />

      <AllTimeStatsCard stats={stats} description="Complete pick performance history" />
    </div>
  );
}


