'use client';

import { useRouter, usePathname } from 'next/navigation';
import { DateTime } from 'luxon';
import { cn } from '@/lib/utils';

interface WeeklySelectorProps {
  selectedWeek: string;
  weekList: string[];
  className?: string;
}

function formatWeekDisplay(weekString: string): string {
  const [year, week] = weekString.split('-W').map((n) => parseInt(n));

  const dt = DateTime.fromObject({
    weekYear: year,
    weekNumber: week,
  }).plus({ week: 1 });

  const firstDay = dt.startOf('week');
  const lastDay = firstDay.endOf('week');

  const formatDate = (date: DateTime) => {
    return date.toFormat('LLL d');
  };

  return `Week ${formatDate(firstDay)} to ${formatDate(lastDay)}`;
}

export function WeeklySelector({
  selectedWeek,
  weekList,
  className,
}: WeeklySelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleWeekChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const week = event.target.value;
    if (week === selectedWeek) return;

    // Navigate to the week-specific route
    const basePath = pathname.replace(/\/weekly\/.*$/, '') || '/leaderboard';
    router.push(`${basePath}/weekly/${week}`);
  };

  return (
    <div className={cn('w-full', className)}>
      <label htmlFor="week-select" className="sr-only">
        Select week
      </label>
      <select
        id="week-select"
        value={selectedWeek}
        onChange={handleWeekChange}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        {weekList.map((week) => (
          <option key={week} value={week}>
            {formatWeekDisplay(week)}
          </option>
        ))}
      </select>
    </div>
  );
}

