'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { UserDropdown } from './UserDropdown';
import { User } from './User';
import { FeedbackDialog } from '@/components/Feedback/FeedbackDialog';
import { UserIcon } from 'lucide-react';
import { navigationItems, postLoginRedirect, APP_NAME } from '@/lib/constants';
import type { UserType } from '@/lib/definitions';

interface HeaderClientProps {
  isAuthed: boolean;
  user: { record: UserType; token: string } | null;
  avatarUrl: string | null;
}

export function HeaderClient({ isAuthed, user, avatarUrl }: HeaderClientProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b">
      <div className="lg:flex justify-between p-2 gap-4 mx-auto">
        <div className="flex w-full lg:w-auto justify-between items-center">
          <Link
            href={isAuthed ? postLoginRedirect : '/'}
            className="flex flex-row gap-4 items-center"
            id="logo-link"
          >
            <Image
              className="rounded-xl w-[50px] h-[50px]"
              src="/assets/icons/maskable-icon-512x512.png"
              alt={`${APP_NAME} Logo`}
              width={50}
              height={50}
              priority
            />
            <h2 className="font-bold text-2xl lg:text-3xl">{APP_NAME}</h2>
          </Link>
          <button
            className="block lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        <nav
          className={`${
            mobileMenuOpen ? 'flex' : 'hidden'
          } lg:flex flex-col pt-6 lg:pt-0 text-xl text-right lg:items-center lg:flex-row lg:text-left`}
        >
          <ul className="flex flex-col pt-6 lg:pt-0 text-xl text-right lg:items-center lg:flex-row lg:text-left gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 py-1 px-2 rounded-lg ${
                      isActive
                        ? 'bg-secondary text-secondary-foreground border'
                        : 'hover:text-gray-500'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-6 h-6" />
                    <span
                      className={
                        item.label.includes(' ') ? 'whitespace-nowrap' : ''
                      }
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
            <li>
              {isAuthed && user ? (
                <div className="flex py-1 px-2 rounded-lg">
                  <div className="hidden lg:block">
                    <UserDropdown
                      username={user.record.username}
                      avatarUrl={avatarUrl || ''}
                    />
                  </div>
                  <div className="block lg:hidden">
                    <Link href="/profile" className="flex items-center gap-2">
                      <User
                        username={user.record.username}
                        avatarUrl={avatarUrl || ''}
                      />
                    </Link>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className={`flex items-center gap-2 py-1 px-2 rounded-lg ${
                    pathname === '/login'
                      ? 'bg-secondary text-secondary-foreground border'
                      : 'hover:text-gray-500'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserIcon className="w-6 h-6" />
                  <span>Login</span>
                </Link>
              )}
            </li>
            <li className="pl-2 flex gap-4 justify-end">
              {isAuthed && <FeedbackDialog />}
              <ThemeToggle />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
