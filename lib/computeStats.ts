import type { CategoricalStats, ColumnMeta, ColumnStats, NumericStats } from '@/types';

import { isNullValue } from '@/lib/inferTypes';

function getMedian(values: number[]): number {
  if (!values.length) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

function getPercentile(sorted: number[], percentile: number): number {
  if (!sorted.length) {
    return 0;
  }

  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = index - lower;
  return sorted[lower] + (sorted[upper] - sorted[lower]) * weight;
}

function parseNumericValue(value: string): number {
  return parseFloat(value.replace(/[$,%\s,]/g, ''));
}

export function computeColumnStats(column: ColumnMeta, rows: Record<string, string>[]): ColumnStats {
  const rawValues = rows.map((row) => row[column.name] ?? '');
  const nonNullValues = rawValues.filter((value) => !isNullValue(value));
  const nullCount = rawValues.length - nonNullValues.length;

  if (column.type === 'numeric') {
    const numericValues = nonNullValues
      .map(parseNumericValue)
      .filter((value) => !Number.isNaN(value))
      .sort((left, right) => left - right);

    if (!numericValues.length) {
      return {
        mean: 0,
        median: 0,
        min: 0,
        max: 0,
        stdDev: 0,
        q1: 0,
        q3: 0,
        iqr: 0,
        nullCount,
        uniqueCount: 0,
      } satisfies NumericStats;
    }

    const mean = numericValues.reduce((total, value) => total + value, 0) / numericValues.length;
    const variance =
      numericValues.reduce((total, value) => total + (value - mean) ** 2, 0) / numericValues.length;
    const q1 = getPercentile(numericValues, 25);
    const q3 = getPercentile(numericValues, 75);

    return {
      mean,
      median: getMedian(numericValues),
      min: numericValues[0],
      max: numericValues[numericValues.length - 1],
      stdDev: Math.sqrt(variance),
      q1,
      q3,
      iqr: q3 - q1,
      nullCount,
      uniqueCount: new Set(numericValues).size,
    } satisfies NumericStats;
  }

  const frequencies = new Map<string, number>();
  nonNullValues.forEach((value) => {
    frequencies.set(value, (frequencies.get(value) ?? 0) + 1);
  });

  const topValues = [...frequencies.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 10)
    .map(([value, count]) => ({ value, count }));

  return {
    uniqueCount: frequencies.size,
    nullCount,
    topValues,
    mode: topValues[0]?.value ?? '',
  } satisfies CategoricalStats;
}
