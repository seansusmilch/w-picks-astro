'use client';

import { useEffect } from 'react';

export function ThemeScript() {
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const theme = localStorage.getItem('theme');
      const isDark =
        theme === 'dark' ||
        (theme === 'system' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, []);

  return null;
}
