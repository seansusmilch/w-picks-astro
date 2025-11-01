import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

  return `Week ${formatDate(firstDay)} to ${formatDate(lastDay)}`;
}

interface WeekSelectProps {
  selectedWeek: string;
  weekList: string[];
  onWeekChange: (week: string) => void;
}

export function WeekSelect({
  selectedWeek,
  weekList,
  onWeekChange,
}: WeekSelectProps) {
  return (
    <div className='w-full max-w-xs'>
      <Select value={selectedWeek} onValueChange={onWeekChange}>
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
  );
}
