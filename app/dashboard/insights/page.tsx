'use client';

import { useMemo } from 'react';

import { InsightsList } from '@/components/insights/InsightsList';
import { useParsedData } from '@/hooks/useParsedData';
import { generateInsights } from '@/lib/generateInsights';

export default function DashboardInsightsPage() {
  const data = useParsedData();
  const insights = useMemo(() => (data ? generateInsights(data) : []), [data]);

  if (!data) {
    return null;
  }

  return <InsightsList data={data} insights={insights} />;
}
