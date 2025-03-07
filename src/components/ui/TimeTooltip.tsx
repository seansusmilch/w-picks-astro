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
          <div className='text-center'>
            <p className='text-3xl font-bold tracking-tight'>
              {datetime
                ?.toLocaleString('en-US', {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true,
                })
                .replace(' AM', 'a')
                .replace(' PM', 'p')}
            </p>
          </div>
        </TooltipTrigger>
        <TooltipContent>{datetime?.toLocaleString('en-US')}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
