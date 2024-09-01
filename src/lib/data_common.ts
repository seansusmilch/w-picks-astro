import { POCKETBASE_PUBLIC_URL } from 'astro:env/client';

export const getUserAvatarUrl = (user_id: string, filename: string) => {
  return new URL(
    `/api/files/users/${user_id}/${filename}`,
    POCKETBASE_PUBLIC_URL
  ).toString();
};
