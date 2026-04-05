import { create } from 'zustand';

import type { FilterState } from '@/types';

interface FilterStore extends FilterState {
  setCategoricalFilter: (column: string, values: string[]) => void;
  setNumericFilter: (column: string, range: [number, number]) => void;
  clearFilter: (column: string) => void;
  clearAll: () => void;
  hasActiveFilters: () => boolean;
  activeCount: () => number;
}

export const useFilterStore = create<FilterStore>((set, get) => ({
  active: {},

  setCategoricalFilter: (column, values) => {
    if (values.length === 0) {
      get().clearFilter(column);
      return;
    }

    set((state) => ({
      active: { ...state.active, [column]: values },
    }));
  },

  setNumericFilter: (column, range) => {
    set((state) => ({
      active: { ...state.active, [column]: range },
    }));
  },

  clearFilter: (column) => {
    set((state) => {
      const next = { ...state.active };
      delete next[column];
      return { active: next };
    });
  },

  clearAll: () => set({ active: {} }),

  hasActiveFilters: () => Object.keys(get().active).length > 0,

  activeCount: () => Object.keys(get().active).length,
}));

