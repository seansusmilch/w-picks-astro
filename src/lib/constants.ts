import { CalendarDaysIcon, ClockIcon, TrophyIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navigationItems: NavItem[] = [
  {
    href: '/stats/weekly',
    label: 'Weekly',
    icon: TrophyIcon,
  },
  {
    href: '/stats',
    label: 'All Time',
    icon: TrophyIcon,
  },
  {
    href: '/matchups/today',
    label: 'Today',
    icon: ClockIcon,
  },
  {
    href: '/matchups',
    label: 'Matchups',
    icon: CalendarDaysIcon,
  },
];

export const postLoginRedirect = '/stats/weekly';
