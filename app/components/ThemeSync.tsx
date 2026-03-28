'use client';

import { useEffect } from 'react';

interface ThemeSyncProps {
  isDark: boolean;
}

export function ThemeSync({ isDark }: ThemeSyncProps) {
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return null;
}
