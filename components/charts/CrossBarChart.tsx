'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

import { useIsDarkMode } from '@/hooks/useIsDarkMode';
import { applyFilters } from '@/lib/applyFilters';
import { useFilterStore } from '@/store/filterStore';
import type { ColumnMeta, ParsedData } from '@/types';

interface CrossBarChartProps {
  data: ParsedData;
  column: ColumnMeta;
  filteredRows: Record<string, string>[];
  height?: number;
}

export function CrossBarChart({ data, column, filteredRows, height = 280 }: CrossBarChartProps) {
  const active = useFilterStore((state) => state.active);
  const activeSelection = useFilterStore((state) => state.active[column.name]);
  const setCategoricalFilter = useFilterStore((state) => state.setCategoricalFilter);
  const clearFilter = useFilterStore((state) => state.clearFilter);
  const isDarkMode = useIsDarkMode();

  const rowsForChart = useMemo(
    () => applyFilters(data.rows, active, { excludeColumns: [column.name] }),
    [active, column.name, data.rows],
  );

  const counts = useMemo(() => {
    const sourceRows = activeSelection ? rowsForChart : filteredRows;
    const frequency = new Map<string, number>();

    sourceRows.forEach((row) => {
      const value = row[column.name] ?? '';

      if (!value) {
        return;
      }

      frequency.set(value, (frequency.get(value) ?? 0) + 1);
    });

    return [...frequency.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 12);
  }, [activeSelection, column.name, filteredRows, rowsForChart]);

  const selectedValues = Array.isArray(activeSelection) ? (activeSelection as string[]) : [];
  const hasActiveFilter = selectedValues.length > 0;

  const option: EChartsOption = {
    animationDuration: 180,
    grid: { top: 24, right: 16, bottom: 42, left: 42 },
    tooltip: { trigger: 'item' },
    xAxis: {
      type: 'category',
      axisLabel: { color: isDarkMode ? '#d4d4d8' : '#52525b', interval: 0, rotate: counts.length > 6 ? 24 : 0 },
      axisLine: { lineStyle: { color: isDarkMode ? '#3f3f46' : '#d4d4d8' } },
      data: counts.map(([label]) => label),
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: isDarkMode ? '#d4d4d8' : '#52525b' },
      splitLine: { lineStyle: { color: isDarkMode ? '#3f3f46' : '#e4e4e7' } },
    },
    series: [
      {
        type: 'bar',
        data: counts.map(([label, value]) => ({
          name: label,
          value,
          itemStyle: {
            opacity: !hasActiveFilter || selectedValues.includes(label) ? 1 : 0.3,
            color: selectedValues.includes(label) ? '#378ADD' : '#1D9E75',
            borderRadius: [8, 8, 0, 0],
          },
        })),
      },
    ],
  };

  const handleClick = (params: { name?: string; event?: { event?: MouseEvent } }) => {
    const clickedValue = params.name;

    if (!clickedValue) {
      return;
    }

    const nativeEvent = params.event?.event;
    const isMultiSelect = Boolean(nativeEvent?.ctrlKey || nativeEvent?.metaKey);

    if (isMultiSelect) {
      const nextValues = selectedValues.includes(clickedValue)
        ? selectedValues.filter((value) => value !== clickedValue)
        : [...selectedValues, clickedValue];

      if (nextValues.length === 0) {
        clearFilter(column.name);
        return;
      }

      setCategoricalFilter(column.name, nextValues);
      return;
    }

    if (selectedValues.length === 1 && selectedValues[0] === clickedValue) {
      clearFilter(column.name);
      return;
    }

    setCategoricalFilter(column.name, [clickedValue]);
  };

  return (
    <ReactECharts
      lazyUpdate={false}
      notMerge
      onEvents={{ click: handleClick }}
      option={option}
      style={{ height: `${height}px` }}
      theme={isDarkMode ? 'dark' : undefined}
    />
  );
}

