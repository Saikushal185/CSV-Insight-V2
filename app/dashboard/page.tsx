'use client';

import { useMemo } from 'react';

import { ChartGrid } from '@/components/dashboard/ChartGrid';
import { KPICards } from '@/components/dashboard/KPICards';
import { MiniTable } from '@/components/dashboard/MiniTable';
import { useFilteredRows } from '@/hooks/useFilteredRows';
import { useParsedData } from '@/hooks/useParsedData';
import { suggestDashboardCharts } from '@/lib/suggestCharts';

export default function DashboardOverviewPage() {
  const data = useParsedData();
  const filteredRows = useFilteredRows(data);

  const suggestions = useMemo(() => {
    if (!data) {
      return {
        barColumn: null,
        pieColumn: null,
        lineColumn: null,
        scatterCols: null,
      };
    }

    return suggestDashboardCharts(data.columns);
  }, [data]);

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <KPICards data={data} filteredRows={filteredRows} />
      <ChartGrid data={data} filteredRows={filteredRows} suggestions={suggestions} />
      <MiniTable data={data} filteredRows={filteredRows} />
    </div>
  );
}
