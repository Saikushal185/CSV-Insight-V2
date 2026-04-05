'use client';

import type { ColumnMeta, ColumnStats, NumericStats } from '@/types';

interface StatPanelProps {
  column: ColumnMeta;
  stats: ColumnStats;
  rowCount: number;
}

function formatMetric(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function StatPanel({ column, stats, rowCount }: StatPanelProps) {
  const nullRate = rowCount === 0 ? 0 : stats.nullCount / rowCount;
  const nullRateWidth = `${Math.round(nullRate * 100)}%`;
  const nullRateTone = nullRate > 0.1 ? 'bg-red-500' : 'bg-blue-500';

  if (column.type === 'numeric') {
    const numericStats = stats as NumericStats;
    const metrics = [
      ['Mean', formatMetric(numericStats.mean)],
      ['Median', formatMetric(numericStats.median)],
      ['Min', formatMetric(numericStats.min)],
      ['Max', formatMetric(numericStats.max)],
      ['Std Dev', formatMetric(numericStats.stdDev)],
      ['Q1', formatMetric(numericStats.q1)],
      ['Q3', formatMetric(numericStats.q3)],
      ['IQR', formatMetric(numericStats.iqr)],
    ];

    return (
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">{column.name} statistics</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map(([label, value]) => (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900" key={label}>
              <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
              <p className="mt-2 text-lg font-semibold text-zinc-950 dark:text-zinc-100">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-300">
          <p>{stats.nullCount.toLocaleString()} nulls</p>
          <p>{stats.uniqueCount.toLocaleString()} unique values</p>
        </div>
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <span>Null rate</span>
            <span>{Math.round(nullRate * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-900">
            <div className={`h-full rounded-full ${nullRateTone}`} style={{ width: nullRateWidth }} />
          </div>
        </div>
      </section>
    );
  }

  const topValue = 'topValues' in stats ? stats.topValues[0] : null;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">{column.name} statistics</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Mode</p>
          <p className="mt-2 text-lg font-semibold text-zinc-950 dark:text-zinc-100">{'mode' in stats ? stats.mode : '—'}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Unique count</p>
          <p className="mt-2 text-lg font-semibold text-zinc-950 dark:text-zinc-100">{stats.uniqueCount.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Null count</p>
          <p className="mt-2 text-lg font-semibold text-zinc-950 dark:text-zinc-100">{stats.nullCount.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Top value</p>
          <p className="mt-2 text-lg font-semibold text-zinc-950 dark:text-zinc-100">
            {topValue ? `${topValue.value} (${topValue.count})` : '—'}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          <span>Null rate</span>
          <span>{Math.round(nullRate * 100)}%</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-900">
          <div className={`h-full rounded-full ${nullRateTone}`} style={{ width: nullRateWidth }} />
        </div>
      </div>
    </section>
  );
}

