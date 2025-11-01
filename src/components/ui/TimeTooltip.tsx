'use client';

import { useState, useEffect } from 'react';

export function TimeTooltip({ time }: { time: Date }) {
  const [datetime, setDatetime] = useState<Date | null>(null);

  useEffect(() => {
    setDatetime(new Date(time));
  }, [time]);

  return (
    <div className="text-center">
      <p className="text-3xl font-bold tracking-tight">
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
  );
}
