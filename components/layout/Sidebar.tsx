'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { FilterBadge } from '@/components/layout/FilterBadge';
import type { ParsedData } from '@/types';

interface SidebarProps {
  data: ParsedData;
}

const links = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/profile', label: 'Column Profile' },
  { href: '/dashboard/table', label: 'Data Table' },
  { href: '/dashboard/insights', label: 'Insights' },
];

export function Sidebar({ data }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 px-4 py-5 dark:border-zinc-700 dark:bg-zinc-900 lg:flex">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">CSV Insight</p>
        <h1 className="mt-2 text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-100">Studio v2</h1>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              className={[
                'block rounded-xl px-3 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800',
              ].join(' ')}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Dataset</p>
          <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">{data.fileName}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-zinc-500 dark:text-zinc-400">Rows</p>
            <p className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">{data.rowCount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-zinc-500 dark:text-zinc-400">Columns</p>
            <p className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">{data.columns.length.toLocaleString()}</p>
          </div>
        </div>
        <FilterBadge />
      </div>
    </aside>
  );
}

