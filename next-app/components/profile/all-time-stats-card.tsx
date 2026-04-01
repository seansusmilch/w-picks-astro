import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3 } from 'lucide-react';
import type { StatType } from '@/lib/definitions';

interface AllTimeStatsCardProps {
  stats: StatType | null;
  description?: string;
}

export function AllTimeStatsCard({
  stats,
  description = 'Your complete pick performance history',
}: AllTimeStatsCardProps) {
  const winPicks = stats?.win_picks || 0;
  const losePicks = stats?.lose_picks || 0;
  const totalPicks = stats?.total_picks || 0;
  const progressValue = totalPicks > 0 ? (winPicks / totalPicks) * 100 : 0;
  const wlRatio = losePicks > 0 ? (winPicks / losePicks).toFixed(2) : winPicks > 0 ? winPicks.toFixed(2) : '0.00';

  return (
    <Card className='mb-6'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <BarChart3 className='h-5 w-5 text-primary' />
          <CardTitle className='text-xl'>All-Time Stats</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {totalPicks > 0 && (
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>{wlRatio} W/L</span>
              <span className='font-medium'>{progressValue.toFixed(1)}%</span>
            </div>
            <Progress value={progressValue} className='h-3' />
            <div className='flex justify-between text-xs text-muted-foreground'>
              <span>{winPicks} wins</span>
              <span>{totalPicks} total picks</span>
            </div>
          </div>
        )}

        {totalPicks === 0 && (
          <div className='text-center py-8 text-muted-foreground'>
            <p className='text-sm'>
              No picks yet. Start making picks to see your stats!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
