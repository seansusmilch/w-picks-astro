import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/pocketbase-server';
import { getUserAvatarUrl } from '@/lib/utils';
import { ProfileEditPageClient } from '@/components/profile/profile-edit-page-client';

export default async function ProfileEditPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect('/login');
  }

  const avatarUrl = getUserAvatarUrl(user.record.id, user.record.avatar);

  return (
    <ProfileEditPageClient
      avatarUrl={avatarUrl}
      username={user.record.username}
      bio={user.record.bio}
    />
  );
}

