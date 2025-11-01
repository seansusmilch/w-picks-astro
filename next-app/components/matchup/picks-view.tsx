'use client';

import type { PickType } from '@/lib/definitions';
import { PickSlab } from './pick-slab';

interface PicksViewProps {
  picks: PickType[];
}

export function PicksView({ picks }: PicksViewProps) {
  return (
    <div className='flex flex-col gap-2'>
      {picks.map((pick) => {
        const user = pick.expand?.user;
        if (!user) return null;
        return <PickSlab key={pick.id} pick={pick} user={user} />;
      })}
    </div>
  );
}
