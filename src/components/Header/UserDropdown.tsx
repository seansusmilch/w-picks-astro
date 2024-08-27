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
      <DropdownMenuTrigger onClick={() => setDropOpen((val) => !val)}>
        {user.record.username}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className='text-md'>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className='text-md'>
          <a href='/profile'>Profile</a>
        </DropdownMenuItem>
        <DropdownMenuItem className='text-md'>
          <a href='/logout'>Logout</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
