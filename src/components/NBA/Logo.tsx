import { TeamMap } from './teamMap';
import { cn } from '@/lib/utils';

export function Logo({
  tricode,
  ...props
}: {
  tricode: string;
  [key: string]: any;
}) {
  const { logo, name_full } = TeamMap[tricode] || TeamMap['NBA'];
  const { className } = props;

  // Apply invert filter for Utah Jazz logo in dark mode
  const shouldInvert =
    tricode === 'UTA' && !!document.querySelector('html.dark');
  return (
    <img
      src={logo}
      alt={`${name_full} Logo`}
      {...props}
      className={cn(shouldInvert ? 'dark:invert' : '', className)}
    />
  );
}
