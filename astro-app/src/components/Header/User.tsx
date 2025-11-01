import { UserAvatar } from '@/components/Profile/UserAvatar';

export function User({
  avatarUrl,
  username,
}: {
  avatarUrl: string;
  username: string;
}) {
  return (
    <>
      <UserAvatar avatar_url={avatarUrl} />
      <span className='bg-linear-to-r from-cyan-500 to-purple-500 inline-block text-transparent bg-clip-text'>
        {username}
      </span>
    </>
  );
}
