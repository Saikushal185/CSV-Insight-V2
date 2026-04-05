'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { FilterBadge } from '@/components/layout/FilterBadge';
import { useFilteredRows } from '@/hooks/useFilteredRows';
import { useIsDarkMode } from '@/hooks/useIsDarkMode';
import { useParsedData } from '@/hooks/useParsedData';
import { useFilterStore } from '@/store/filterStore';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/profile': 'Column Profile',
  '/dashboard/table': 'Data Table',
  '/dashboard/insights': 'Insights',
};

export function TopBar() {
  const pathname = usePathname();
  const data = useParsedData();
  const filteredRows = useFilteredRows(data);
  const clearAll = useFilterStore((state) => state.clearAll);
  const hasActiveFilters = useFilterStore((state) => state.hasActiveFilters());
  const isDarkMode = useIsDarkMode();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const title = pageTitles[pathname] ?? 'Dashboard';
  const filteredLabel = useMemo(() => {
    if (!data) {
      return 'Loading dataset...';
    }

    return `Showing ${filteredRows.length.toLocaleString()} of ${data.rowCount.toLocaleString()} rows`;
  }, [data, filteredRows.length]);

  const toggleTheme = () => {
    const nextIsDark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', nextIsDark);
    localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur dark:border-zinc-700 dark:bg-zinc-950/90 sm:px-6">
      <div>
        <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">{title}</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{filteredLabel}</p>
      </div>

      <div className="flex items-center gap-3">
        <FilterBadge />
        {hasActiveFilters ? (
          <button
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            onClick={clearAll}
            type="button"
          >
            Clear all filters
          </button>
        ) : null}
        <button
          className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          onClick={toggleTheme}
          type="button"
        >
          {isMounted ? (isDarkMode ? 'Light mode' : 'Dark mode') : 'Theme'}
        </button>
        <Link
          className="rounded-full bg-zinc-950 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
          href="/"
        >
          Upload new file
        </Link>
      </div>
    </header>
  );
}

