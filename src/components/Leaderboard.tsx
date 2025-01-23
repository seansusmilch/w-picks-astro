import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserAvatar } from '@/components/Profile/UserAvatar';
import type { RecordModel } from 'pocketbase';

type SortType = 'winRate' | 'wlRatio';

export function Leaderboard({ data }: { data: RecordModel[] }) {
  const calculateWLRatio = (wins: number, losses: number) => {
    return (wins / (losses || 1)).toFixed(2);
  };

  const calculateWinRate = (wins: number, losses: number) => {
    const total = wins + losses;
    return ((wins / total) * 100).toFixed(1);
  };

  return (
    <div className='w-full space-y-4'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>User</TableHead>
            <TableHead className='text-right'>Total Wins</TableHead>
            <TableHead className='text-right'>W/L Ratio</TableHead>
            <TableHead className='text-right'>Win Rate %</TableHead>
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
                    <span>{entry.expand.user.username}</span>
                  </div>
                </a>
              </TableCell>
              <TableCell className='text-right'>{entry.win_picks}</TableCell>
              <TableCell className='text-right'>
                {entry.win_loss_ratio.toFixed(2)}
              </TableCell>
              <TableCell className='text-right'>
                {entry.win_pick_rate.toFixed(2)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
