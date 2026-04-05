'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

import { useIsDarkMode } from '@/hooks/useIsDarkMode';
import { computeBins } from '@/lib/binning';
import { computeColumnStats } from '@/lib/computeStats';
import type { InsightItem, ParsedData } from '@/types';

interface InsightCardProps {
  insight: InsightItem;
  data: ParsedData;
}

const severityStyles: Record<InsightItem['severity'], string> = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
};

export function InsightCard({ insight, data }: InsightCardProps) {
  const column = data.columns.find((item) => item.name === insight.column);
  const isDarkMode = useIsDarkMode();

  const option: EChartsOption = useMemo(() => {
    if (!column) {
      return {};
    }

    if (column.type === 'numeric') {
      const values = data.rows
        .map((row) => parseFloat((row[column.name] ?? '').replace(/[$,%\s,]/g, '')))
        .filter((value) => !Number.isNaN(value));
      const bins = computeBins(values);

      return {
        animationDuration: 180,
        grid: { top: 24, right: 16, bottom: 42, left: 36 },
        tooltip: { trigger: 'item' },
        xAxis: {
          type: 'category',
          data: bins.map((bin) => bin.range),
          axisLabel: { color: isDarkMode ? '#d4d4d8' : '#52525b', rotate: bins.length > 6 ? 24 : 0 },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: isDarkMode ? '#d4d4d8' : '#52525b' },
          splitLine: { lineStyle: { color: isDarkMode ? '#3f3f46' : '#e4e4e7' } },
        },
        series: [{ type: 'bar', data: bins.map((bin) => bin.count), itemStyle: { color: '#378ADD', borderRadius: [8, 8, 0, 0] } }],
      };
    }

    const stats = computeColumnStats(column, data.rows);
    const topValues = 'topValues' in stats ? stats.topValues.slice(0, 5) : [];

    return {
      animationDuration: 180,
      grid: { top: 24, right: 16, bottom: 42, left: 36 },
      tooltip: { trigger: 'item' },
      xAxis: {
        type: 'category',
        data: topValues.map((item) => item.value),
        axisLabel: { color: isDarkMode ? '#d4d4d8' : '#52525b', rotate: topValues.length > 4 ? 24 : 0 },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: isDarkMode ? '#d4d4d8' : '#52525b' },
        splitLine: { lineStyle: { color: isDarkMode ? '#3f3f46' : '#e4e4e7' } },
      },
      series: [{ type: 'bar', data: topValues.map((item) => item.count), itemStyle: { color: '#1D9E75', borderRadius: [8, 8, 0, 0] } }],
    };
  }, [column, data.rows, isDarkMode]);

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full ${severityStyles[insight.severity]}`} />
            <span className="rounded-full border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
              {insight.column}
            </span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">{insight.title}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{insight.description}</p>
          </div>
        </div>
        <Link
          className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
          href={`/dashboard/profile?col=${encodeURIComponent(insight.column)}`}
        >
          View in Profile
        </Link>
      </div>

      {column ? <ReactECharts lazyUpdate={false} notMerge option={option} style={{ height: '280px' }} theme={isDarkMode ? 'dark' : undefined} /> : null}
    </article>
  );
}

