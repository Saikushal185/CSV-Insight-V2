'use client';

import { InsightCard } from '@/components/insights/InsightCard';
import type { InsightItem, ParsedData } from '@/types';

interface InsightsListProps {
  insights: InsightItem[];
  data: ParsedData;
}

const severityOrder: InsightItem['severity'][] = ['critical', 'warning', 'info'];

export function InsightsList({ insights, data }: InsightsListProps) {
  return (
    <div className="space-y-6">
      {severityOrder.map((severity) => {
        const severityInsights = insights.filter((item) => item.severity === severity);

        if (severityInsights.length === 0) {
          return null;
        }

        return (
          <section key={severity}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold capitalize text-zinc-950 dark:text-zinc-100">{severity}</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {severityInsights.length.toLocaleString()} insight{severityInsights.length === 1 ? '' : 's'} in this group.
              </p>
            </div>
            <div className="space-y-4">
              {severityInsights.map((insight) => (
                <InsightCard data={data} insight={insight} key={`${insight.column}-${insight.title}`} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

