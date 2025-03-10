import { TeamMap } from './teamMap';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function Logo({
  tricode,
  className,
  ...props
}: {
  tricode: string;
  className?: string;
  [key: string]: any;
}) {
  const [invert, setInvert] = useState(false);
  const { logo, name_full } = TeamMap[tricode] || TeamMap['NBA'];

  useEffect(() => {
    if (tricode !== 'UTA') return;
    setInvert(!!document?.querySelector('html.dark'));
    console.log(invert);
  }, []);

  // Apply invert filter for Utah Jazz logo in dark mode
  return (
    <img
      src={logo}
      alt={`${name_full} Logo`}
      {...props}
      className={cn(invert ? 'dark:invert' : '', className)}
    />
  );
}
