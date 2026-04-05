'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

import { useIsDarkMode } from '@/hooks/useIsDarkMode';
import { applyFilters } from '@/lib/applyFilters';
import { useFilterStore } from '@/store/filterStore';
import type { ColumnMeta, ParsedData } from '@/types';

interface CrossScatterChartProps {
  data: ParsedData;
  colX: ColumnMeta;
  colY: ColumnMeta;
  filteredRows: Record<string, string>[];
}

export function CrossScatterChart({ data, colX, colY, filteredRows }: CrossScatterChartProps) {
  const active = useFilterStore((state) => state.active);
  const activeRange = useFilterStore((state) => state.active[colX.name]);
  const setNumericFilter = useFilterStore((state) => state.setNumericFilter);
  const clearFilter = useFilterStore((state) => state.clearFilter);
  const isDarkMode = useIsDarkMode();

  const rowsForChart = useMemo(
    () => applyFilters(data.rows, active, { excludeColumns: [colX.name] }),
    [active, colX.name, data.rows],
  );

  const points = useMemo(() => {
    const sourceRows = activeRange ? rowsForChart : filteredRows;

    return sourceRows
      .map((row) => ({
        x: parseFloat((row[colX.name] ?? '').replace(/[$,%\s,]/g, '')),
        y: parseFloat((row[colY.name] ?? '').replace(/[$,%\s,]/g, '')),
      }))
      .filter((point) => !Number.isNaN(point.x) && !Number.isNaN(point.y));
  }, [activeRange, colX.name, colY.name, filteredRows, rowsForChart]);

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
        brush: {
          type: ['rect', 'clear'],
        },
      },
    },
    brush: {
      xAxisIndex: 0,
      brushMode: 'single',
    },
    xAxis: {
      type: 'value',
      name: colX.name,
      axisLabel: { color: isDarkMode ? '#d4d4d8' : '#52525b' },
      splitLine: { lineStyle: { color: isDarkMode ? '#3f3f46' : '#e4e4e7' } },
    },
    yAxis: {
      type: 'value',
      name: colY.name,
      axisLabel: { color: isDarkMode ? '#d4d4d8' : '#52525b' },
      splitLine: { lineStyle: { color: isDarkMode ? '#3f3f46' : '#e4e4e7' } },
    },
    series: [
      {
        type: 'scatter',
        data: points.map((point) => ({
          value: [point.x, point.y],
          itemStyle: {
            color: '#378ADD',
            opacity:
              !selectedRange || (point.x >= selectedRange[0] && point.x <= selectedRange[1]) ? 0.85 : 0.15,
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
      clearFilter(colX.name);
      return;
    }

    const selectedPoints = indices.map((index) => points[index]).filter(Boolean);

    if (selectedPoints.length === 0) {
      clearFilter(colX.name);
      return;
    }

    const values = selectedPoints.map((point) => point.x);
    setNumericFilter(colX.name, [Math.min(...values), Math.max(...values)]);
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
