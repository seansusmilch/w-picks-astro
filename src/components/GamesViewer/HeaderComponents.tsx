import { useRef, useEffect } from 'react';
import { HelpIcon } from '@/components/ui/help-icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useGames } from './GamesProvider';

export function SwipePopover() {
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    triggerRef.current?.click();

    const timer = setTimeout(() => {
      triggerRef.current?.click();
    }, 2000);
    // Cancel the timer if the user clicks anywhere on the page
    document.body.addEventListener('click', () => {
      console.log('clicked');
      clearTimeout(timer);
    });

    return () => clearTimeout(timer);
  }, []);

  return (
    <Popover>
      <PopoverTrigger ref={triggerRef}>
        <HelpIcon />
      </PopoverTrigger>
      <PopoverContent
        className='bg-secondary text-secondary-foreground border-none'
        side='top'
      >
        Swipe left and right to see more matchups
      </PopoverContent>
    </Popover>
  );
}

export function Title() {
  const { currentPage, pages } = useGames();
  const page = pages.find((p) => p.date_code === parseInt(currentPage));

  if (!page) return null;

  return <h1 className='text-xl font-semibold'>Games ({page.title})</h1>;
}
