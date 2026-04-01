'use client';

import { useSyncExternalStore, type ImgHTMLAttributes } from 'react';
import { TeamMap } from '@/lib/team-map';
import { cn } from '@/lib/utils';

interface LogoProps extends ImgHTMLAttributes<HTMLImageElement> {
  tricode: string;
}

function subscribeToDarkMode(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => observer.disconnect();
}

function getDarkSnapshot() {
  return document.documentElement.classList.contains('dark');
}

function getServerSnapshot() {
  return false;
}

export function Logo({ tricode, className, ...props }: LogoProps) {
  const isDark = useSyncExternalStore(subscribeToDarkMode, getDarkSnapshot, getServerSnapshot);
  const invert = tricode === 'UTA' && isDark;
  const { logo, name_full } = TeamMap[tricode as keyof typeof TeamMap] || TeamMap['NBA'];

  return (
    <img
      src={logo}
      alt={`${name_full} Logo`}
      {...props}
      className={cn(invert ? 'dark:invert' : '', className)}
    />
  );
}
