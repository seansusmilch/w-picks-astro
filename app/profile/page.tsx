import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUserAvatarUrl } from '@/lib/data_common';
import ProfileView from '@/components/Profile/ProfileView';
import { getPicksByUser } from '@/lib/picks';
import { getStatsByUserId } from '@/lib/stats';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Profile',
};

export default async function ProfileIndexPage() {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');
  
  if (!pbAuth) {
    redirect('/login');
  }

  const user = await getUser(pbAuth.value);
  if (!user) {
    redirect('/login');
  }

  user.record.avatar_url = getUserAvatarUrl(user.record.id, user.record.avatar);
  const picks = await getPicksByUser(user.record.id);
  const stats = await getStatsByUserId(user.record.id);

  return (
    <div className="p-2 lg:p-4 max-w-[1400px] pb-10">
      <ProfileView user={user.record} picks={picks} stats={stats} />
    </div>
  );
}
