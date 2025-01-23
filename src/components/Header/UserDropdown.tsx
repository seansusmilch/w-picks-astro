import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { UserAvatar } from '@/components/Profile/UserAvatar';
import { getUserAvatarUrl } from '@/lib/data_common';

export function UserDropdown({ user }: { user: any }) {
  const [dropOpen, setDropOpen] = useState(false);
  const avatarUrl = getUserAvatarUrl(user.record.id, user.record.avatar);
  return (
    <DropdownMenu open={dropOpen} onOpenChange={(val) => setDropOpen(val)}>
      <DropdownMenuTrigger
        className='flex gap-2 items-center'
        onClick={() => setDropOpen((val) => !val)}
      >
        <UserAvatar avatar_url={avatarUrl} />
        <span className='bg-gradient-to-r from-cyan-500 to-purple-500 inline-block text-transparent bg-clip-text'>
          {user.record.username}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className>
        <DropdownMenuLabel className='text-md'>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a className='text-md' href='/profile'>
            Profile
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a className='text-md' href='/logout'>
            Logout
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
