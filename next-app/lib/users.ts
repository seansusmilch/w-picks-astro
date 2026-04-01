import { getAdminPocketBase } from '@/lib/pocketbase-server';
import { getUserAvatarUrl } from '@/lib/utils';

export interface UserProfile {
  id: string;
  username: string;
  bio: string;
  avatar_url: string | null;
}

export async function getProfilesByIds(ids: string[]): Promise<UserProfile[]> {
  if (!ids.length) return [];

  const pb = await getAdminPocketBase();
  const filter = ids.map((id) => `id = "${id}"`).join(' || ');

  const records = await pb.collection('users').getFullList({ filter });

  return records.map((record) => ({
    id: record.id,
    username: record.username,
    bio: record.bio || '',
    avatar_url: record.avatar
      ? getUserAvatarUrl(record.id, record.avatar)
      : null,
  }));
}
