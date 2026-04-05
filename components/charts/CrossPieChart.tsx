'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

import { useIsDarkMode } from '@/hooks/useIsDarkMode';
import { applyFilters } from '@/lib/applyFilters';
import { useFilterStore } from '@/store/filterStore';
import type { ColumnMeta, ParsedData } from '@/types';

interface CrossPieChartProps {
  data: ParsedData;
  column: ColumnMeta;
  filteredRows: Record<string, string>[];
}

export function CrossPieChart({ data, column, filteredRows }: CrossPieChartProps) {
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
      .slice(0, 8);
  }, [activeSelection, column.name, filteredRows, rowsForChart]);

  const selectedValues = Array.isArray(activeSelection) ? (activeSelection as string[]) : [];
  const hasActiveFilter = selectedValues.length > 0;

  const option: EChartsOption = {
    animationDuration: 180,
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: {
      bottom: 0,
      textStyle: { color: isDarkMode ? '#d4d4d8' : '#52525b' },
    },
    series: [
      {
        type: 'pie',
        radius: ['30%', '65%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: isDarkMode ? '#18181b' : '#ffffff', borderWidth: 2 },
        data: counts.map(([label, value]) => ({
          name: label,
          value,
          selected: selectedValues.includes(label),
          itemStyle: {
            opacity: !hasActiveFilter || selectedValues.includes(label) ? 1 : 0.3,
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
      style={{ height: '280px' }}
      theme={isDarkMode ? 'dark' : undefined}
    />
  );
}

