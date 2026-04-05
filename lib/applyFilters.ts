import type { FilterState } from '@/types';

interface ApplyFiltersOptions {
  excludeColumns?: string[];
}

function parseRangeComparableValue(cellValue: string): number | null {
  const trimmed = cellValue.trim();

  if (!trimmed) {
    return null;
  }

  if ((trimmed.includes('-') || trimmed.includes('/')) && !Number.isNaN(Date.parse(trimmed))) {
    return Date.parse(trimmed);
  }

  const numeric = parseFloat(trimmed.replace(/[$,%\s,]/g, ''));
  return Number.isNaN(numeric) ? null : numeric;
}

export function applyFilters(
  rows: Record<string, string>[],
  active: FilterState['active'],
  options: ApplyFiltersOptions = {},
): Record<string, string>[] {
  const effectiveEntries = Object.entries(active).filter(([column]) => !options.excludeColumns?.includes(column));

  if (effectiveEntries.length === 0) {
    return rows;
  }

  return rows.filter((row) =>
    effectiveEntries.every(([column, filter]) => {
      const cellValue = row[column] ?? '';

      if (Array.isArray(filter) && filter.length === 2 && typeof filter[0] === 'number') {
        const range =
          typeof filter[1] === 'number' ? ([filter[0], filter[1]] as [number, number]) : null;
        const comparable = parseRangeComparableValue(cellValue);

        if (comparable == null || !range) {
          return false;
        }

        return comparable >= range[0] && comparable <= range[1];
      }

      if (Array.isArray(filter)) {
        return (filter as string[]).includes(cellValue);
      }

      return true;
    }),
  );
}
