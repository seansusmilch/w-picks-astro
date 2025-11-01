import { cookies } from 'next/headers';
import { getUser } from '@/lib/data';
import { getUserAvatarUrl } from '@/lib/data_common';
import { HeaderClient } from './HeaderClient';

export async function Header() {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');
  
  let isAuthed = false;
  let user = null;
  let avatarUrl = null;

  if (pbAuth) {
    try {
      const userData = await getUser(pbAuth.value);
      if (userData) {
        isAuthed = true;
        user = userData;
        avatarUrl = getUserAvatarUrl(user.record.id, user.record.avatar);
      }
    } catch (error) {
      // User not authenticated
      isAuthed = false;
    }
  }

  return <HeaderClient isAuthed={isAuthed} user={user} avatarUrl={avatarUrl} />;
}
