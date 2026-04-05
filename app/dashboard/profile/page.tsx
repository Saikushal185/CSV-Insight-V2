'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { ColumnSelector } from '@/components/profile/ColumnSelector';
import { DistributionChart } from '@/components/profile/DistributionChart';
import { StatPanel } from '@/components/profile/StatPanel';
import { ValueFrequencyTable } from '@/components/profile/ValueFrequencyTable';
import { useParsedData } from '@/hooks/useParsedData';
import { computeColumnStats } from '@/lib/computeStats';

export default function DashboardProfilePage() {
  const data = useParsedData();
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedName = searchParams.get('col') ?? data?.columns[0]?.name ?? '';
  const selectedColumn = data?.columns.find((column) => column.name === selectedName) ?? data?.columns[0];

  useEffect(() => {
    if (data && !searchParams.get('col') && data.columns[0]) {
      router.replace(`/dashboard/profile?col=${encodeURIComponent(data.columns[0].name)}`);
    }
  }, [data, router, searchParams]);

  if (!data || !selectedColumn) {
    return null;
  }

  const stats = computeColumnStats(selectedColumn, data.rows);

  return (
    <div className="space-y-6">
      <ColumnSelector
        columns={data.columns}
        onChange={(columnName) => router.replace(`/dashboard/profile?col=${encodeURIComponent(columnName)}`)}
        selectedColumn={selectedColumn.name}
      />
      <StatPanel column={selectedColumn} rowCount={data.rowCount} stats={stats} />
      <DistributionChart column={selectedColumn} data={data} />
      {selectedColumn.type === 'categorical' ? <ValueFrequencyTable column={selectedColumn} rows={data.rows} /> : null}
    </div>
  );
}

