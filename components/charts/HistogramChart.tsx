'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

import { useIsDarkMode } from '@/hooks/useIsDarkMode';
import { applyFilters } from '@/lib/applyFilters';
import { computeBins } from '@/lib/binning';
import { useFilterStore } from '@/store/filterStore';
import type { ColumnMeta, ParsedData } from '@/types';

interface HistogramChartProps {
  data: ParsedData;
  column: ColumnMeta;
  filteredRows: Record<string, string>[];
}

export function HistogramChart({ data, column, filteredRows }: HistogramChartProps) {
  const active = useFilterStore((state) => state.active);
  const activeRange = useFilterStore((state) => state.active[column.name]);
  const setNumericFilter = useFilterStore((state) => state.setNumericFilter);
  const clearFilter = useFilterStore((state) => state.clearFilter);
  const isDarkMode = useIsDarkMode();

  const rowsForChart = useMemo(
    () => applyFilters(data.rows, active, { excludeColumns: [column.name] }),
    [active, column.name, data.rows],
  );

  const bins = useMemo(() => {
    const sourceRows = activeRange ? rowsForChart : filteredRows;
    const values = sourceRows
      .map((row) => parseFloat((row[column.name] ?? '').replace(/[$,%\s,]/g, '')))
      .filter((value) => !Number.isNaN(value));

    return computeBins(values);
  }, [activeRange, column.name, filteredRows, rowsForChart]);

  const selectedRange =
    Array.isArray(activeRange) && typeof activeRange[0] === 'number' && typeof activeRange[1] === 'number'
      ? ([activeRange[0], activeRange[1]] as [number, number])
      : null;

  const option: EChartsOption = {
    animationDuration: 180,
    tooltip: { trigger: 'item' },
    toolbox: {
      right: 8,
      feature: {
        brush: { type: ['rect', 'clear'] },
      },
    },
    brush: {
      xAxisIndex: 0,
      brushMode: 'single',
    },
    grid: { top: 24, right: 16, bottom: 42, left: 42 },
    xAxis: {
      type: 'category',
      axisLabel: { color: isDarkMode ? '#d4d4d8' : '#52525b', rotate: bins.length > 7 ? 24 : 0 },
      axisLine: { lineStyle: { color: isDarkMode ? '#3f3f46' : '#d4d4d8' } },
      data: bins.map((bin) => bin.range),
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: isDarkMode ? '#d4d4d8' : '#52525b' },
      splitLine: { lineStyle: { color: isDarkMode ? '#3f3f46' : '#e4e4e7' } },
    },
    series: [
      {
        type: 'bar',
        data: bins.map((bin) => ({
          value: bin.count,
          itemStyle: {
            color: '#378ADD',
            opacity:
              !selectedRange || (bin.max >= selectedRange[0] && bin.min <= selectedRange[1]) ? 0.95 : 0.25,
            borderRadius: [8, 8, 0, 0],
          },
        })),
      },
    ],
  };

  const handleBrushSelected = (params: {
    batch?: Array<{ selected?: Array<{ dataIndex?: number[] }> }>;
  }) => {
    const indices = params.batch?.[0]?.selected?.[0]?.dataIndex ?? [];

    if (indices.length === 0) {
      clearFilter(column.name);
      return;
    }

    const selectedBins = indices.map((index) => bins[index]).filter(Boolean);

    if (selectedBins.length === 0) {
      clearFilter(column.name);
      return;
    }

    setNumericFilter(column.name, [
      Math.min(...selectedBins.map((bin) => bin.min)),
      Math.max(...selectedBins.map((bin) => bin.max)),
    ]);
  };

  return (
    <ReactECharts
      lazyUpdate={false}
      notMerge
      onEvents={{ brushSelected: handleBrushSelected }}
      option={option}
      style={{ height: '280px' }}
      theme={isDarkMode ? 'dark' : undefined}
    />
  );
}
