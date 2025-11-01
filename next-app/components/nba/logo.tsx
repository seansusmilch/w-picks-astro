'use client';

import { TeamMap } from '@/lib/team-map';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface LogoProps {
  tricode: string;
  className?: string;
  [key: string]: any;
}

export function Logo({ tricode, className, ...props }: LogoProps) {
  const [invert, setInvert] = useState(false);
  const { logo, name_full } = TeamMap[tricode as keyof typeof TeamMap] || TeamMap['NBA'];

  useEffect(() => {
    if (tricode !== 'UTA') return;
    setInvert(!!document?.querySelector('html.dark'));
  }, [tricode]);

  return (
    <img
      src={logo}
      alt={`${name_full} Logo`}
      {...props}
      className={cn(invert ? 'dark:invert' : '', className)}
    />
  );
}

