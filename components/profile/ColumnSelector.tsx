'use client';

import type { ColumnMeta } from '@/types';

interface ColumnSelectorProps {
  columns: ColumnMeta[];
  selectedColumn: string;
  onChange: (columnName: string) => void;
}

export function ColumnSelector({ columns, selectedColumn, onChange }: ColumnSelectorProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200" htmlFor="column-selector">
        Column
      </label>
      <select
        className="mt-3 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        id="column-selector"
        onChange={(event) => onChange(event.target.value)}
        value={selectedColumn}
      >
        {columns.map((column) => (
          <option key={column.name} value={column.name}>
            {column.name}
          </option>
        ))}
      </select>
    </div>
  );
}

