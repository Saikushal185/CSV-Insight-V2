import type { ColumnMeta } from '@/types';

export function suggestDashboardCharts(columns: ColumnMeta[]): {
  barColumn: ColumnMeta | null;
  pieColumn: ColumnMeta | null;
  lineColumn: ColumnMeta | null;
  scatterCols: [ColumnMeta, ColumnMeta] | null;
} {
  const categorical = columns.filter((column) => column.type === 'categorical');
  const numeric = columns.filter((column) => column.type === 'numeric');
  const dates = columns.filter((column) => column.type === 'date');
  const barColumn = categorical.find((column) => column.uniqueCount >= 2 && column.uniqueCount <= 20) ?? null;

  return {
    barColumn,
    pieColumn:
      categorical.find(
        (column) => column.name !== barColumn?.name && column.uniqueCount >= 2 && column.uniqueCount <= 8,
      ) ?? null,
    lineColumn: dates[0] ?? null,
    scatterCols: numeric.length >= 2 ? [numeric[0], numeric[1]] : null,
  };
}
