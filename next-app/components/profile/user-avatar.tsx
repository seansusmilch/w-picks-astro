import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  avatarUrl?: string | null;
  username: string;
  className?: string;
}

export function UserAvatar({ avatarUrl, username, className }: UserAvatarProps) {
  const initials = username
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={cn('border-2 border-border', className)}>
      {avatarUrl && <AvatarImage alt={`${username}'s avatar`} src={avatarUrl} />}
      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-semibold">
        {initials || '?'}
      </AvatarFallback>
    </Avatar>
  );
}

