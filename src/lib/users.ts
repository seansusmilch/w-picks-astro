import { getAPB, getPB } from '@/lib/data';
import { getUserAvatarUrl } from '@/lib/data_common';

export async function getProfileById(id: string) {
  return await getProfilesByIds([id])[0];
}

export async function getProfilesByIds(ids: string[]) {
  const pb = await getAPB();

  const idsFilter = ids
    .map((id) => pb.filter('id = {:id}', { id }))
    .join(' || ');

  const users = await pb.collection('users').getFullList({
    filter: idsFilter,
  });
  return users.map((user) => ({
    id: user.id,
    username: user.username,
    bio: user.bio,
    avatar_url: getUserAvatarUrl(user.id, user.avatar),
  }));
}
