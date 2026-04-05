import type { Bin } from '@/types';

export function computeBins(values: number[]): Bin[] {
  if (values.length === 0) {
    return [];
  }

  const sorted = [...values].sort((left, right) => left - right);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  if (min === max) {
    return [{ range: String(min), min, max, count: values.length }];
  }

  const bucketCount = Math.min(20, Math.max(5, Math.ceil(Math.log2(values.length) + 1)));
  const width = (max - min) / bucketCount;
  const bins = Array.from({ length: bucketCount }, (_, index) => ({
    range: `${(min + width * index).toFixed(1)}–${(min + width * (index + 1)).toFixed(1)}`,
    min: min + width * index,
    max: min + width * (index + 1),
    count: 0,
  }));

  values.forEach((value) => {
    const binIndex = Math.min(bucketCount - 1, Math.floor((value - min) / width));
    bins[binIndex].count += 1;
  });

  return bins;
}

