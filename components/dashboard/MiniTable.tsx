'use client';

import Link from 'next/link';

import type { ParsedData } from '@/types';

interface MiniTableProps {
  data: ParsedData;
  filteredRows: Record<string, string>[];
}

export function MiniTable({ data, filteredRows }: MiniTableProps) {
  const previewRows = filteredRows.slice(0, 10);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">Matching rows</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">First 10 rows that match the active dashboard filters.</p>
        </div>
        <Link className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-300" href="/dashboard/table">
          View full table
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              {data.columns.map((column) => (
                <th className="px-3 py-2 font-medium text-zinc-600 dark:text-zinc-300" key={column.name}>
                  {column.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, index) => (
              <tr className="border-t border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-700/50" key={`${row.order_id ?? index}`}>
                {data.columns.map((column) => (
                  <td className="max-w-[180px] truncate px-3 py-2 text-zinc-700 dark:text-zinc-200" key={column.name}>
                    {row[column.name] || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
        Showing {previewRows.length} of {filteredRows.length.toLocaleString()} matching rows.
      </p>
    </section>
  );
}

