import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function TimeTooltip({ time }: { time: Date }) {
  console.log('Time:', time);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <p className='text-md font-bold'>
            {time.toLocaleString('en-US', { weekday: 'short' }).toUpperCase()}
          </p>
          <p className='text-sm font-semibold'>
            {time
              .toLocaleString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              })
              .replace(' AM', 'a')
              .replace(' PM', 'p')}
          </p>
        </TooltipTrigger>
        <TooltipContent>{time.toLocaleString()}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
