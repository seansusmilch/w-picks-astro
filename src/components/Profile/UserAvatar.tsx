import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import clsx from 'clsx';

export function UserAvatar({
  avatar_url,
  className,
}: {
  avatar_url: string;
  className?: string;
}) {
  return (
    <Avatar className={clsx('border', className)}>
      <AvatarImage alt='User avatar' src={avatar_url} />
      <AvatarFallback>?</AvatarFallback>
    </Avatar>
  );
}
