'use client';

import { LeaderboardRow } from './leaderboard-row';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { StatWithExpand } from '@/lib/stats';

interface LeaderboardTableProps {
  data: StatWithExpand[] | import('@/lib/stats').WeeklyStatWithExpand[];
  currentUserId?: string;
}

export function LeaderboardTable({ data, currentUserId }: LeaderboardTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full text-center py-8 text-muted-foreground">
        <p className="text-base font-medium">No stats available</p>
        <p className="text-xs mt-1">Check back later for leaderboard rankings</p>
      </div>
    );
  }

  return (
    <div className="w-full -mx-3 sm:mx-0">
      <Table className="min-w-[600px]">
        <TableHeader>
          <TableRow>
            <TableHead className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              #
            </TableHead>
            <TableHead className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[140px]">
              User
            </TableHead>
            <TableHead className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Wins
            </TableHead>
            <TableHead className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Picks
            </TableHead>
            <TableHead className="hidden md:table-cell px-3 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              W/L
            </TableHead>
            <TableHead className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Win %
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((entry, index) => (
            <LeaderboardRow
              key={entry.id || entry.expand?.user?.id || index}
              entry={entry}
              rank={index + 1}
              currentUserId={currentUserId}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

