'use client';

import { DataTable } from '@/components/table/DataTable';
import { useFilteredRows } from '@/hooks/useFilteredRows';
import { useParsedData } from '@/hooks/useParsedData';

export default function DashboardTablePage() {
  const data = useParsedData();
  const filteredRows = useFilteredRows(data);

  if (!data) {
    return null;
  }

  return <DataTable allRows={data.rows} columns={data.columns} rows={filteredRows} />;
}

