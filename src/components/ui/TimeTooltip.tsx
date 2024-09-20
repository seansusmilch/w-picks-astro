import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useFormattedDate } from '@/lib/utils';

export function TimeTooltip({ time }: { time: Date }) {
  const datetime = useFormattedDate(time);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <p className='text-md font-bold'>
            {datetime
              ?.toLocaleString('en-US', { weekday: 'short' })
              .toUpperCase()}
          </p>
          <p className='text-sm font-semibold'>
            {datetime
              ?.toLocaleString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              })
              .replace(' AM', 'a')
              .replace(' PM', 'p')}
          </p>
        </TooltipTrigger>
        <TooltipContent>{datetime?.toLocaleString('en-US')}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
