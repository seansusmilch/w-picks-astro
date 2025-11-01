'use client';

import Link from 'next/link';
import { UserAvatar } from '@/components/profile/user-avatar';
import { RankBadge } from './rank-badge';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { StatType, UserType } from '@/lib/definitions';
import type { RecordModel } from 'pocketbase';

type StatWithExpand = StatType &
  RecordModel & {
    expand?: {
      user?: UserType;
    };
  };

interface LeaderboardRowProps {
  entry: StatWithExpand;
  rank: number;
  currentUserId?: string;
}

export function LeaderboardRow({
  entry,
  rank,
  currentUserId,
}: LeaderboardRowProps) {
  const user = entry.expand?.user;
  const isCurrentUser = currentUserId === user?.id;
  const username = user?.username || 'Unknown';
  const avatarUrl = user?.avatar_url || null;

  return (
    <TableRow
      className={cn(
        isCurrentUser && 'bg-primary/5 ring-1 ring-primary'
      )}
    >
      <TableCell className="px-3 py-2 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <RankBadge rank={rank} />
          <span className="text-sm font-medium tabular-nums text-muted-foreground">{rank}</span>
        </div>
      </TableCell>
      <TableCell className="px-3 py-2">
        <Link
          href={`/profile/${username}`}
          className="flex items-center gap-2 hover:underline"
        >
          <UserAvatar avatarUrl={avatarUrl} username={username} className="h-7 w-7" />
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm font-medium truncate">{username}</span>
            {isCurrentUser && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 flex-shrink-0">
                You
              </Badge>
            )}
          </div>
        </Link>
      </TableCell>
      <TableCell className="px-3 py-2 text-right tabular-nums text-sm font-medium">{entry.win_picks}</TableCell>
      <TableCell className="px-3 py-2 text-right tabular-nums text-sm text-muted-foreground">
        {entry.total_picks}
      </TableCell>
      <TableCell className="hidden md:table-cell px-3 py-2 text-right tabular-nums text-sm text-muted-foreground">
        {entry.win_loss_ratio?.toFixed(2) || '0.00'}
      </TableCell>
      <TableCell className="px-3 py-2 text-right tabular-nums text-sm font-medium">
        {entry.win_pick_rate?.toFixed(1) || 0}%
      </TableCell>
    </TableRow>
  );
}

