'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { StatType, UserType } from '@/lib/definitions';
import type { RecordModel } from 'pocketbase';

type StatWithExpand = StatType &
  RecordModel & {
    expand?: {
      user?: UserType;
    };
  };

type SortField = 'win_pick_rate' | 'win_picks' | 'total_picks';

interface LeaderboardFiltersProps {
  data: StatWithExpand[];
  onFilteredDataChange: (filteredData: StatWithExpand[]) => void;
  className?: string;
}

export function LeaderboardFilters({
  data,
  onFilteredDataChange,
  className,
}: LeaderboardFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('win_pick_rate');

  // Filter and sort logic
  useEffect(() => {
    const filteredAndSorted = [...data]
      .filter((entry) => {
        if (!searchQuery) return true;
        const username = entry.expand?.user?.username?.toLowerCase() || '';
        return username.includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => {
        const aValue = a[sortField] ?? 0;
        const bValue = b[sortField] ?? 0;
        
        // Always sort descending (highest first)
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return bValue - aValue;
        }
        return 0;
      });

    onFilteredDataChange(filteredAndSorted);
  }, [data, searchQuery, sortField, onFilteredDataChange]);

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center', className)}>
      <div className="flex-1">
        <Input
          type="search"
          placeholder="Search by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setSortField('win_pick_rate')}
          className={cn(
            'px-3 py-2 text-sm rounded-md border transition-colors',
            sortField === 'win_pick_rate'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background border-input hover:bg-accent'
          )}
        >
          Win %
        </button>
        <button
          type="button"
          onClick={() => setSortField('win_picks')}
          className={cn(
            'px-3 py-2 text-sm rounded-md border transition-colors',
            sortField === 'win_picks'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background border-input hover:bg-accent'
          )}
        >
          Wins
        </button>
        <button
          type="button"
          onClick={() => setSortField('total_picks')}
          className={cn(
            'px-3 py-2 text-sm rounded-md border transition-colors',
            sortField === 'total_picks'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background border-input hover:bg-accent'
          )}
        >
          Picks
        </button>
      </div>
    </div>
  );
}

