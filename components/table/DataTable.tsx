'use client';

import { useEffect, useMemo, useState } from 'react';

import { ColumnFilter } from '@/components/table/ColumnFilter';
import { ExportMenu } from '@/components/table/ExportMenu';
import type { ColumnMeta } from '@/types';

interface DataTableProps {
  columns: ColumnMeta[];
  rows: Record<string, string>[];
  allRows: Record<string, string>[];
}

type SortDirection = 'asc' | 'desc' | null;

const PAGE_SIZE = 25;

function getNextSortDirection(direction: SortDirection): SortDirection {
  if (direction === null) return 'asc';
  if (direction === 'asc') return 'desc';
  return null;
}

export function DataTable({ columns, rows, allRows }: DataTableProps) {
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [page, setPage] = useState(1);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    () => Object.fromEntries(columns.map((column) => [column.name, ''])),
  );

  useEffect(() => {
    setColumnFilters(Object.fromEntries(columns.map((column) => [column.name, ''])));
  }, [columns]);

  const localFilteredRows = useMemo(() => {
    return rows.filter((row) =>
      columns.every((column) => {
        const query = columnFilters[column.name]?.trim().toLowerCase() ?? '';
        if (!query) return true;
        return (row[column.name] ?? '').toLowerCase().includes(query);
      }),
    );
  }, [columnFilters, columns, rows]);

  const sortedRows = useMemo(() => {
    const nextRows = [...localFilteredRows];

    if (!sortCol || !sortDir) {
      return nextRows;
    }

    const columnType = columns.find((column) => column.name === sortCol)?.type;

    nextRows.sort((left, right) => {
      const leftValue = left[sortCol] ?? '';
      const rightValue = right[sortCol] ?? '';
      let comparison = 0;

      if (columnType === 'numeric') {
        comparison =
          parseFloat(leftValue.replace(/[$,%\s,]/g, '')) - parseFloat(rightValue.replace(/[$,%\s,]/g, ''));
      } else if (columnType === 'date') {
        comparison = Date.parse(leftValue) - Date.parse(rightValue);
      } else {
        comparison = leftValue.localeCompare(rightValue, undefined, { numeric: true, sensitivity: 'base' });
      }

      return sortDir === 'asc' ? comparison : comparison * -1;
    });

    return nextRows;
  }, [columns, localFilteredRows, sortCol, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [columnFilters, sortCol, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const currentPageRows = sortedRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((column) => (
            <ColumnFilter
              columnName={column.name}
              key={column.name}
              onChange={(value) => setColumnFilters((current) => ({ ...current, [column.name]: value }))}
              value={columnFilters[column.name] ?? ''}
            />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">Rows</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {sortedRows.length.toLocaleString()} rows after global and local filters.
            </p>
          </div>
          <ExportMenu allRows={allRows} currentPageRows={currentPageRows} filteredRows={sortedRows} />
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                {columns.map((column) => {
                  const indicator = sortCol === column.name ? (sortDir === 'asc' ? '↑' : sortDir === 'desc' ? '↓' : '') : '';

                  return (
                    <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-300" key={column.name}>
                      <button
                        className="inline-flex items-center gap-2"
                        onClick={() => {
                          const nextDirection = sortCol === column.name ? getNextSortDirection(sortDir) : 'asc';
                          setSortCol(nextDirection ? column.name : null);
                          setSortDir(nextDirection);
                        }}
                        type="button"
                      >
                        {column.name} <span className="text-xs text-zinc-400">{indicator}</span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {currentPageRows.map((row, index) => (
                <tr className="border-t border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-700/50" key={`${row.order_id ?? index}`}>
                  {columns.map((column) => (
                    <td
                      className={[
                        'px-4 py-3 text-zinc-700 dark:text-zinc-200',
                        column.type === 'numeric' ? 'text-right' : 'text-left',
                      ].join(' ')}
                      key={column.name}
                    >
                      {row[column.name] || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Page {page} of {pageCount}
          </p>
          <div className="flex items-center gap-3">
            <button className="rounded-full border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">
              Previous
            </button>
            <button className="rounded-full border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600" disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} type="button">
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

