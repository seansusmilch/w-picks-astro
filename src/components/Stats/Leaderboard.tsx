import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserAvatar } from '@/components/Profile/UserAvatar';
import type { StatType, UserType } from '@/lib/definitions';

type StatWithExpand = StatType & {
  expand: {
    user: UserType;
  };
};

export function Leaderboard({ data }: { data: StatWithExpand[] }) {
  return (
    <div className='w-full overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-10'>#</TableHead>
            <TableHead>User</TableHead>
            <TableHead className='text-right'>Wins</TableHead>
            <TableHead className='hidden sm:table-cell text-right'>
              Picks
            </TableHead>
            <TableHead className='hidden sm:table-cell text-right'>
              W/L
            </TableHead>
            <TableHead className='text-right'>Win %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((entry, index) => (
            <TableRow key={entry.expand.user.id}>
              <TableCell className='font-medium'>{index + 1}</TableCell>
              <TableCell>
                <a href={`/profile/${entry.expand.user.username}`}>
                  <div className='flex items-center gap-2'>
                    <UserAvatar
                      avatar_url={entry.expand.user.avatar_url}
                      className='h-8 w-8'
                    />
                    <span className='truncate'>
                      {entry.expand.user.username}
                    </span>
                  </div>
                </a>
              </TableCell>
              <TableCell className='text-right tabular-nums'>
                {entry.win_picks}
              </TableCell>
              <TableCell className='hidden sm:table-cell text-right tabular-nums'>
                {entry.total_picks}
              </TableCell>
              <TableCell className='hidden sm:table-cell text-right tabular-nums'>
                {entry.win_loss_ratio?.toFixed(2) || 0}
              </TableCell>
              <TableCell className='text-right tabular-nums'>
                {entry.win_pick_rate?.toFixed(1) || 0}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className='space-y-2'>
      <div className='h-12 w-full rounded-md bg-muted animate-pulse' />
      <div className='h-12 w-full rounded-md bg-muted animate-pulse' />
      <div className='h-12 w-full rounded-md bg-muted animate-pulse' />
      <div className='h-12 w-full rounded-md bg-muted animate-pulse' />
      <div className='h-12 w-full rounded-md bg-muted animate-pulse' />
    </div>
  );
}
