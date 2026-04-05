'use client';

import { CrossBarChart } from '@/components/charts/CrossBarChart';
import { CrossLineChart } from '@/components/charts/CrossLineChart';
import { CrossPieChart } from '@/components/charts/CrossPieChart';
import { CrossScatterChart } from '@/components/charts/CrossScatterChart';
import type { ParsedData } from '@/types';

interface DashboardChartSuggestions {
  barColumn: ParsedData['columns'][number] | null;
  pieColumn: ParsedData['columns'][number] | null;
  lineColumn: ParsedData['columns'][number] | null;
  scatterCols: [ParsedData['columns'][number], ParsedData['columns'][number]] | null;
}

interface ChartGridProps {
  data: ParsedData;
  filteredRows: Record<string, string>[];
  suggestions: DashboardChartSuggestions;
}

function PlaceholderCard({ title, message }: { title: string; message: string }) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex h-[280px] flex-col justify-between rounded-xl border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
        <div>
          <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">{title}</h3>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
        </div>
      </div>
    </article>
  );
}

export function ChartGrid({ data, filteredRows, suggestions }: ChartGridProps) {
  const numericColumns = data.columns.filter((column) => column.type === 'numeric');
  const lineMetric = numericColumns.find((column) => column.name !== suggestions.scatterCols?.[0]?.name) ?? numericColumns[0];

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">
          {suggestions.barColumn ? `${suggestions.barColumn.name} distribution` : 'Bar chart'}
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Click bars to filter the rest of the overview.</p>
        {suggestions.barColumn ? (
          <CrossBarChart column={suggestions.barColumn} data={data} filteredRows={filteredRows} />
        ) : (
          <PlaceholderCard message="No categorical column with 2–20 values was detected." title="No categorical bar dimension" />
        )}
      </article>

      <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">
          {suggestions.pieColumn ? `${suggestions.pieColumn.name} share` : 'Pie chart'}
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Use slices for single-value or multi-select filtering.</p>
        {suggestions.pieColumn ? (
          <CrossPieChart column={suggestions.pieColumn} data={data} filteredRows={filteredRows} />
        ) : (
          <PlaceholderCard message="No compact categorical column with 2–8 values was detected." title="No pie dimension" />
        )}
      </article>

      <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">
          {suggestions.lineColumn ? `${suggestions.lineColumn.name} trend` : 'Line chart'}
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Brush the time range with the zoom controls below the chart.</p>
        {suggestions.lineColumn && lineMetric ? (
          <CrossLineChart data={data} dateColumn={suggestions.lineColumn} filteredRows={filteredRows} valueColumn={lineMetric} />
        ) : (
          <PlaceholderCard message="No date column was detected for a timeline view." title="No date axis available" />
        )}
      </article>

      <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">
          {suggestions.scatterCols ? `${suggestions.scatterCols[0].name} vs ${suggestions.scatterCols[1].name}` : 'Scatter chart'}
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Use the rectangle brush to focus on a numeric range.</p>
        {suggestions.scatterCols ? (
          <CrossScatterChart colX={suggestions.scatterCols[0]} colY={suggestions.scatterCols[1]} data={data} filteredRows={filteredRows} />
        ) : (
          <PlaceholderCard message="At least two numeric columns are required for a scatter plot." title="No numeric pair available" />
        )}
      </article>
    </section>
  );
}

