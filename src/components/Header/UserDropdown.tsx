import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

export function UserDropdown({ user }: { user: any }) {
  const [dropOpen, setDropOpen] = useState(false);
  return (
    <DropdownMenu open={dropOpen} onOpenChange={(val) => setDropOpen(val)}>
      <DropdownMenuTrigger
        className='bg-gradient-to-r from-cyan-500 to-purple-500 inline-block text-transparent bg-clip-text'
        onClick={() => setDropOpen((val) => !val)}
      >
        {user.record.username}
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
          <a className='text-md' href='/logout'>
            Logout
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
