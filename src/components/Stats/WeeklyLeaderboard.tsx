import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Leaderboard } from './Leaderboard';
import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { queryClient } from '@/stores/query';
import { useQuery } from '@tanstack/react-query';
import { actions } from 'astro:actions';
import { DateTime } from 'luxon';

function formatWeekDisplay(weekString: string): string {
  const [year, week] = weekString.split('-W').map((n) => parseInt(n));

  const dt = DateTime.fromObject({
    weekYear: year,
    weekNumber: week,
  }).plus({ week: 1 });

  const firstDay = dt.startOf('week');
  const lastDay = firstDay.endOf('week');

  // Format the dates
  const formatDate = (date: DateTime) => {
    return date.toFormat('LLL d');
  };

  console.log(weekString, formatDate(firstDay), formatDate(lastDay), dt);

  return `Week ${formatDate(firstDay)} to ${formatDate(lastDay)}`;
}

export function WeeklyLeaderboard({
  initialData,
  initialWeek,
  weekList,
}: {
  initialData: any[];
  initialWeek: string;
  weekList: string[];
}) {
  const client = useStore(queryClient);
  const [selectedWeek, setSelectedWeek] = useState<string>(initialWeek);

  const { data, isLoading } = useQuery(
    {
      queryKey: ['weeklyStats', selectedWeek],
      queryFn: async () => {
        const { data, error } = await actions.stats.getWeeklyStats({
          week: selectedWeek,
        });
        if (error) {
          throw new Error('Failed to fetch weekly stats');
        }
        console.log('data', data);
        return data;
      },
      initialData: selectedWeek === initialWeek ? initialData : undefined,
      staleTime: 1000 * 10,
      gcTime: 1000 * 60 * 60 * 24,
    },
    client
  );

  return (
    <div className='w-full flex flex-col gap-4'>
      <div className='w-full max-w-xs'>
        <Select value={selectedWeek} onValueChange={setSelectedWeek}>
          <SelectTrigger>
            <SelectValue placeholder='Select week' />
          </SelectTrigger>
          <SelectContent>
            {weekList.map((option) => (
              <SelectItem key={option} value={option}>
                <span className='text-lg'>{formatWeekDisplay(option)}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className='space-y-2'>
          <div className='h-12 w-full rounded-md bg-gray-200 animate-pulse' />
          <div className='h-12 w-full rounded-md  bg-gray-200 animate-pulse' />
          <div className='h-12 w-full rounded-md bg-gray-200 animate-pulse' />
          <div className='h-12 w-full rounded-md bg-gray-200 animate-pulse' />
          <div className='h-12 w-full rounded-md bg-gray-200 animate-pulse' />
        </div>
      ) : (
        <Leaderboard data={data} />
      )}
    </div>
  );
}
