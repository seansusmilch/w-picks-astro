import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { User } from '@/components/Header/User';

export function UserDropdown({
  username,
  avatarUrl,
}: {
  username: string;
  avatarUrl: string;
}) {
  const [dropOpen, setDropOpen] = useState(false);
  return (
    <DropdownMenu open={dropOpen} onOpenChange={(val) => setDropOpen(val)}>
      <DropdownMenuTrigger
        className='flex gap-2 items-center'
        onClick={() => setDropOpen((val) => !val)}
      >
        <User avatarUrl={avatarUrl} username={username} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className='text-md'>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a className='text-md' href='/profile'>
            Profile
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a className='text-md' href='/logout' data-astro-prefetch='false'>
            Logout
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
