import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Leaderboard } from './Leaderboard';
import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { queryClient } from '@/stores/query';
import { useQuery } from '@tanstack/react-query';
import { actions } from 'astro:actions';

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
    },
    client
  );

  return (
    <div className='space-y-4'>
      <div className='w-full max-w-xs'>
        <Select value={selectedWeek} onValueChange={setSelectedWeek}>
          <SelectTrigger>
            <SelectValue placeholder='Select week' />
          </SelectTrigger>
          <SelectContent>
            {weekList.map((option) => (
              <SelectItem key={option} value={option}>
                <h2 className='text-xl font-semibold'>{option}</h2>
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
