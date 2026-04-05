'use client';

import { useFilterStore } from '@/store/filterStore';

export function FilterBadge() {
  const activeCount = useFilterStore((state) => state.activeCount());
  const clearAll = useFilterStore((state) => state.clearAll);

  if (activeCount === 0) {
    return null;
  }

  return (
    <button
      className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition-opacity hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
      onClick={clearAll}
      type="button"
    >
      {activeCount} filter{activeCount === 1 ? '' : 's'} active
    </button>
  );
}

