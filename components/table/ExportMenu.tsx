'use client';

import Papa from 'papaparse';

interface ExportMenuProps {
  allRows: Record<string, string>[];
  filteredRows: Record<string, string>[];
  currentPageRows: Record<string, string>[];
}

function downloadCsv(rows: Record<string, string>[], fileName: string) {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function ExportMenu({ allRows, filteredRows, currentPageRows }: ExportMenuProps) {
  return (
    <details className="relative">
      <summary className="cursor-pointer rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 list-none hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800">
        Export
      </summary>
      <div className="absolute right-0 top-12 z-10 min-w-[200px] rounded-xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
        <button className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => downloadCsv(allRows, 'csv-insight-all.csv')} type="button">
          Export all rows
        </button>
        <button className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => downloadCsv(filteredRows, 'csv-insight-filtered.csv')} type="button">
          Export filtered rows
        </button>
        <button className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => downloadCsv(currentPageRows, 'csv-insight-page.csv')} type="button">
          Export current page
        </button>
      </div>
    </details>
  );
}

