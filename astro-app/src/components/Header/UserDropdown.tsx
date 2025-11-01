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
import { UserCircle2, LogOut, Settings } from 'lucide-react';

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
          <a className='text-md flex items-center gap-2' href='/profile'>
            <UserCircle2 className='h-4 w-4' />
            Profile
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            className='text-md flex items-center gap-2'
            href='/profile/settings'
          >
            <Settings className='h-4 w-4' />
            Settings
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            className='text-md flex items-center gap-2'
            href='/logout'
            data-astro-prefetch='false'
          >
            <LogOut className='h-4 w-4' />
            Logout
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
