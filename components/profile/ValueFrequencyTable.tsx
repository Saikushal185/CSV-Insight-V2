'use client';

import { computeColumnStats } from '@/lib/computeStats';
import type { ColumnMeta } from '@/types';

interface ValueFrequencyTableProps {
  column: ColumnMeta;
  rows: Record<string, string>[];
}

export function ValueFrequencyTable({ column, rows }: ValueFrequencyTableProps) {
  const stats = computeColumnStats(column, rows);
  const values = 'topValues' in stats ? stats.topValues : [];

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">Top values</h3>
      <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-300">Value</th>
              <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-300">Count</th>
            </tr>
          </thead>
          <tbody>
            {values.map((item) => (
              <tr className="border-t border-zinc-200 dark:border-zinc-700" key={item.value}>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">{item.value}</td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">{item.count.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

