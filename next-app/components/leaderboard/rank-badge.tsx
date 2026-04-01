'use client';

import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankBadgeProps {
  rank: number;
  className?: string;
}

export function RankBadge({ rank, className }: RankBadgeProps) {
  if (rank > 3) return null;

  const rankConfig = {
    1: {
      icon: Trophy,
      bgColor: 'bg-yellow-500/20',
      iconColor: 'text-yellow-500',
      borderColor: 'border-yellow-500/30',
    },
    2: {
      icon: Trophy,
      bgColor: 'bg-gray-400/20',
      iconColor: 'text-gray-400',
      borderColor: 'border-gray-400/30',
    },
    3: {
      icon: Trophy,
      bgColor: 'bg-orange-600/20',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-600/30',
    },
  };

  const config = rankConfig[rank as keyof typeof rankConfig];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border-2',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <Icon className={cn('h-2.5 w-2.5 sm:h-3 sm:w-3', config.iconColor)} />
    </div>
  );
}

