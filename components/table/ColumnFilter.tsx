'use client';

interface ColumnFilterProps {
  columnName: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColumnFilter({ columnName, value, onChange }: ColumnFilterProps) {
  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400" htmlFor={`filter-${columnName}`}>
        {columnName}
      </label>
      <input
        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        id={`filter-${columnName}`}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`Filter ${columnName}`}
        type="text"
        value={value}
      />
    </div>
  );
}

