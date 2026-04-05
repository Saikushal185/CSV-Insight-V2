'use client';

import { useMemo } from 'react';

import { applyFilters } from '@/lib/applyFilters';
import { useFilterStore } from '@/store/filterStore';
import type { ParsedData } from '@/types';

export function useFilteredRows(data: ParsedData | null): Record<string, string>[] {
  const active = useFilterStore((state) => state.active);

  return useMemo(() => {
    if (!data) {
      return [];
    }

    return applyFilters(data.rows, active);
  }, [active, data]);
}

