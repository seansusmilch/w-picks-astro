import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUserAvatarUrl } from '@/lib/data_common';
import ProfileView from '@/components/Profile/ProfileView';
import { getStatsByUserId } from '@/lib/stats';
import { getPicksByUser } from '@/lib/picks';
import { getUserProfile } from '@/actions/users';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Profile',
};

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');
  
  if (!pbAuth) {
    redirect('/login');
  }

  const currentUser = await getUser(pbAuth.value);
  if (!currentUser) {
    redirect('/login');
  }

  const { username } = await params;

  try {
    const user = await getUserProfile({ username });
    user.avatar_url = getUserAvatarUrl(user.id, user.avatar);
    const picks = await getPicksByUser(user.id);
    const stats = await getStatsByUserId(user.id);

    return (
      <div className="p-2 lg:p-4 max-w-[1400px] pb-10">
        <ProfileView user={user} picks={picks} stats={stats} />
      </div>
    );
  } catch (error) {
    redirect('/');
  }
}
