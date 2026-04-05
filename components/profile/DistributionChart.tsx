'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

import { HistogramChart } from '@/components/charts/HistogramChart';
import { useIsDarkMode } from '@/hooks/useIsDarkMode';
import { computeColumnStats } from '@/lib/computeStats';
import type { ColumnMeta, ParsedData } from '@/types';

interface DistributionChartProps {
  data: ParsedData;
  column: ColumnMeta;
}

export function DistributionChart({ data, column }: DistributionChartProps) {
  const isDarkMode = useIsDarkMode();

  if (column.type === 'numeric') {
    return <HistogramChart column={column} data={data} filteredRows={data.rows} />;
  }

  const stats = computeColumnStats(column, data.rows);
  const values = 'topValues' in stats ? stats.topValues : [];

  const option: EChartsOption = useMemo(
    () => ({
      animationDuration: 180,
      grid: { top: 24, right: 16, bottom: 48, left: 42 },
      tooltip: { trigger: 'item' },
      xAxis: {
        type: 'category',
        data: values.map((item) => item.value),
        axisLabel: { color: isDarkMode ? '#d4d4d8' : '#52525b', rotate: values.length > 6 ? 24 : 0 },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: isDarkMode ? '#d4d4d8' : '#52525b' },
        splitLine: { lineStyle: { color: isDarkMode ? '#3f3f46' : '#e4e4e7' } },
      },
      series: [
        {
          type: 'bar',
          data: values.map((item) => ({
            value: item.count,
            itemStyle: { color: '#1D9E75', borderRadius: [8, 8, 0, 0] },
          })),
        },
      ],
    }),
    [isDarkMode, values],
  );

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">Distribution</h3>
      <ReactECharts lazyUpdate={false} notMerge option={option} style={{ height: '280px' }} theme={isDarkMode ? 'dark' : undefined} />
    </section>
  );
}

