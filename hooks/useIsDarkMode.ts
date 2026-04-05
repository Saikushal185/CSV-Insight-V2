'use client';

import { useEffect, useState } from 'react';

export function useIsDarkMode(): boolean {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof document === 'undefined') {
      return true;
    }

    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const element = document.documentElement;
    const syncTheme = () => setIsDarkMode(element.classList.contains('dark'));

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(element, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return isDarkMode;
}

