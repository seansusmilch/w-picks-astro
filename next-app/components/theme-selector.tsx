'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { SegmentedControl } from '@/components/ui/segmented-control';

const themeOptions = [
  { name: 'system', content: <Monitor className="h-4 w-4" /> },
  { name: 'light', content: <Sun className="h-4 w-4" /> },
  { name: 'dark', content: <Moon className="h-4 w-4" /> },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-10 items-center">
        <div className="inline-flex items-center rounded-xl bg-muted p-2">
          <div className="h-8 w-8 animate-pulse rounded-xl bg-background" />
          <div className="h-8 w-8 animate-pulse rounded-xl bg-background" />
          <div className="h-8 w-8 animate-pulse rounded-xl bg-background" />
        </div>
      </div>
    );
  }

  return (
    <SegmentedControl
      options={themeOptions}
      defaultValue={theme || 'system'}
      onChange={setTheme}
    />
  );
}
