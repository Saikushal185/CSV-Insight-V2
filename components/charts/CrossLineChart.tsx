'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

import { useIsDarkMode } from '@/hooks/useIsDarkMode';
import { applyFilters } from '@/lib/applyFilters';
import { useFilterStore } from '@/store/filterStore';
import type { ColumnMeta, ParsedData } from '@/types';

interface CrossLineChartProps {
  data: ParsedData;
  dateColumn: ColumnMeta;
  valueColumn: ColumnMeta;
  filteredRows: Record<string, string>[];
}

function parseNumericValue(value: string): number {
  return parseFloat(value.replace(/[$,%\s,]/g, ''));
}

export function CrossLineChart({ data, dateColumn, valueColumn, filteredRows }: CrossLineChartProps) {
  const active = useFilterStore((state) => state.active);
  const activeRange = useFilterStore((state) => state.active[dateColumn.name]);
  const setNumericFilter = useFilterStore((state) => state.setNumericFilter);
  const clearFilter = useFilterStore((state) => state.clearFilter);
  const isDarkMode = useIsDarkMode();

  const rowsForChart = useMemo(
    () => applyFilters(data.rows, active, { excludeColumns: [dateColumn.name] }),
    [active, data.rows, dateColumn.name],
  );

  const seriesData = useMemo(() => {
    const sourceRows = activeRange ? rowsForChart : filteredRows;
    const grouped = new Map<number, { timestamp: number; value: number }>();

    sourceRows.forEach((row) => {
      const rawDate = row[dateColumn.name] ?? '';
      const timestamp = Date.parse(rawDate);

      if (Number.isNaN(timestamp)) {
        return;
      }

      const rawValue = row[valueColumn.name] ?? '';
      const numericValue = parseNumericValue(rawValue);
      const nextValue = Number.isNaN(numericValue) ? 1 : numericValue;
      const current = grouped.get(timestamp);

      grouped.set(timestamp, {
        timestamp,
        value: (current?.value ?? 0) + nextValue,
      });
    });

    return [...grouped.values()].sort((left, right) => left.timestamp - right.timestamp);
  }, [activeRange, dateColumn.name, filteredRows, rowsForChart, valueColumn.name]);

  const selectedRange =
    Array.isArray(activeRange) && typeof activeRange[0] === 'number' && typeof activeRange[1] === 'number'
      ? ([activeRange[0], activeRange[1]] as [number, number])
      : null;

  const option: EChartsOption = {
    animationDuration: 180,
    tooltip: { trigger: 'axis' },
    grid: { top: 24, right: 16, bottom: 54, left: 42 },
    xAxis: {
      type: 'time',
      axisLabel: { color: isDarkMode ? '#d4d4d8' : '#52525b' },
      axisLine: { lineStyle: { color: isDarkMode ? '#3f3f46' : '#d4d4d8' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: isDarkMode ? '#d4d4d8' : '#52525b' },
      splitLine: { lineStyle: { color: isDarkMode ? '#3f3f46' : '#e4e4e7' } },
    },
    dataZoom: [
      {
        type: 'slider',
        bottom: 8,
        startValue: selectedRange?.[0],
        endValue: selectedRange?.[1],
      },
      {
        type: 'inside',
        startValue: selectedRange?.[0],
        endValue: selectedRange?.[1],
      },
    ],
    series: [
      {
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { color: '#378ADD', width: 3 },
        areaStyle: { color: 'rgba(55, 138, 221, 0.12)' },
        data: seriesData.map((point) => [point.timestamp, point.value]),
      },
    ],
  };

  const handleZoom = (params: {
    batch?: Array<{ startValue?: number; endValue?: number; start?: number; end?: number }>;
    startValue?: number;
    endValue?: number;
    start?: number;
    end?: number;
  }) => {
    if (seriesData.length === 0) {
      clearFilter(dateColumn.name);
      return;
    }

    const payload = params.batch?.[0] ?? params;
    let startValue = payload.startValue;
    let endValue = payload.endValue;

    if (startValue == null || endValue == null) {
      const minTime = seriesData[0].timestamp;
      const maxTime = seriesData[seriesData.length - 1].timestamp;
      const span = maxTime - minTime;
      startValue = minTime + span * ((payload.start ?? 0) / 100);
      endValue = minTime + span * ((payload.end ?? 100) / 100);
    }

    if (startValue <= seriesData[0].timestamp && endValue >= seriesData[seriesData.length - 1].timestamp) {
      clearFilter(dateColumn.name);
      return;
    }

    setNumericFilter(dateColumn.name, [startValue, endValue]);
  };

  return (
    <ReactECharts
      lazyUpdate={false}
      notMerge
      onEvents={{ dataZoom: handleZoom }}
      option={option}
      style={{ height: '280px' }}
      theme={isDarkMode ? 'dark' : undefined}
    />
  );
}
