'use client';

import type { ParsedData } from '@/types';

interface KPICardsProps {
  data: ParsedData;
  filteredRows: Record<string, string>[];
}

export function KPICards({ data, filteredRows }: KPICardsProps) {
  const totalNulls = data.columns.reduce((sum, column) => sum + column.nullCount, 0);
  const isFiltered = filteredRows.length !== data.rowCount;

  const cards = [
    { label: 'Total rows', value: data.rowCount.toLocaleString(), accent: 'text-zinc-950 dark:text-zinc-100' },
    {
      label: 'Filtered rows',
      value: filteredRows.length.toLocaleString(),
      accent: isFiltered ? 'text-blue-600 dark:text-blue-300' : 'text-zinc-950 dark:text-zinc-100',
    },
    { label: 'Columns', value: data.columns.length.toLocaleString(), accent: 'text-zinc-950 dark:text-zinc-100' },
    { label: 'Total nulls', value: totalNulls.toLocaleString(), accent: 'text-zinc-950 dark:text-zinc-100' },
  ];

  return (
    <section className="grid gap-4 xl:grid-cols-4">
      {cards.map((card) => (
        <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800" key={card.label}>
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{card.label}</p>
          <p className={`mt-3 text-3xl font-semibold tracking-tight ${card.accent}`}>{card.value}</p>
          {card.label === 'Filtered rows' && isFiltered ? (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">
              {filteredRows.length.toLocaleString()} of {data.rowCount.toLocaleString()} rows match the current filters.
            </p>
          ) : null}
        </article>
      ))}
    </section>
  );
}

