import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type MatchupType, type PickType } from '@/lib/definitions';
import { PickSlab } from './PickSlab';
import { PickTable } from './PickTable';
import { useState } from 'react';
import { ListIcon, TableIcon, UsersIcon } from 'lucide-react';

type PicksViewProps = {
  picks: PickType[];
  matchup: MatchupType;
};

export function PicksViewToggle({ picks, matchup }: PicksViewProps) {
  const [value, setValue] = useState('slab');

  return (
    <Tabs
      defaultValue='slab'
      value={value}
      onValueChange={setValue}
      className='w-full'
    >
      <div className=''>
        {value === 'slab' && (
          <div className='flex flex-col gap-2'>
            {picks.map((pick) => (
              <PickSlab key={pick.id} pick={pick} user={pick.expand?.user!} />
            ))}
          </div>
        )}
        {value === 'table' && (
          <div className='flex flex-col gap-2'>
            <PickTable matchup={matchup} picks={picks} />
          </div>
        )}
      </div>
      <div className='py-2 flex justify-center'>
        <TabsList className='grid grid-cols-2 h-11 w-20'>
          <TabsTrigger value='slab' className='aspect-square p-0'>
            <ListIcon className='h-4 w-4' />
            <span className='sr-only'>List View</span>
          </TabsTrigger>
          <TabsTrigger value='table' className='aspect-square p-0'>
            <TableIcon className='h-4 w-4' />
            <span className='sr-only'>Team View</span>
          </TabsTrigger>
        </TabsList>
      </div>
    </Tabs>
  );
}
