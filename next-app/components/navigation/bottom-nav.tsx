'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Trophy, LogIn, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  id: string;
}

interface BottomNavProps {
  isAuthenticated: boolean;
}

export function BottomNav({ isAuthenticated }: BottomNavProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: '/home', label: 'Home', icon: Home, id: 'home' },
    { href: '/games', label: 'Games', icon: CalendarDays, id: 'games' },
    ...(isAuthenticated
      ? [
          {
            href: '/leaderboard',
            label: 'Leaderboard',
            icon: Trophy,
            id: 'leaderboard',
          },
          { href: '/profile', label: 'Profile', icon: User, id: 'profile' },
        ]
      : [{ href: '/login', label: 'Login', icon: LogIn, id: 'login' }]),
  ];

  return (
    <nav className='fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden shadow-lg'>
      <div
        className='flex h-16 items-center justify-around'
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === '/leaderboard' &&
              pathname.startsWith('/leaderboard')) ||
            (item.href === '/games' && pathname === '/games') ||
            (item.href === '/login' && pathname === '/login');
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 transition-all duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground active:text-foreground'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center rounded-full p-2 transition-all',
                  isActive && 'bg-primary/10'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-transform',
                    isActive && 'scale-110'
                  )}
                />
              </div>
              <span className='text-xs font-medium'>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
