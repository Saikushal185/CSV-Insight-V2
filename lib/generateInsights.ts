import { computeColumnStats } from '@/lib/computeStats';
import { isNullValue } from '@/lib/inferTypes';
import type { CategoricalStats, InsightItem, NumericStats, ParsedData } from '@/types';

export function generateInsights(data: ParsedData): InsightItem[] {
  const insights: InsightItem[] = [];

  data.columns.forEach((column) => {
    const stats = computeColumnStats(column, data.rows);
    const nullRate = data.rowCount === 0 ? 0 : stats.nullCount / data.rowCount;

    if (nullRate > 0.1) {
      insights.push({
        title: `High missing data in "${column.name}"`,
        description: `${(nullRate * 100).toFixed(1)}% of values are missing (${stats.nullCount} of ${data.rowCount} rows).`,
        type: 'missing',
        column: column.name,
        severity: nullRate > 0.3 ? 'critical' : 'warning',
      });
    }

    if (column.type === 'numeric') {
      const numericStats = stats as NumericStats;
      const lowerFence = numericStats.q1 - 1.5 * numericStats.iqr;
      const upperFence = numericStats.q3 + 1.5 * numericStats.iqr;
      const outlierCount = data.rows.filter((row) => {
        const rawValue = row[column.name] ?? '';

        if (isNullValue(rawValue)) {
          return false;
        }

        const parsed = parseFloat(rawValue.replace(/[$,%\s,]/g, ''));
        return !Number.isNaN(parsed) && (parsed < lowerFence || parsed > upperFence);
      }).length;

      if (outlierCount > 0) {
        insights.push({
          title: `Outliers detected in "${column.name}"`,
          description: `${outlierCount} values fall outside the expected range (${lowerFence.toFixed(2)} to ${upperFence.toFixed(2)}).`,
          type: 'outlier',
          column: column.name,
          severity: outlierCount > data.rowCount * 0.05 ? 'warning' : 'info',
        });
      }

      if (numericStats.mean !== 0 && numericStats.stdDev / Math.abs(numericStats.mean) > 1) {
        insights.push({
          title: `High variance in "${column.name}"`,
          description: `Coefficient of variation is ${((numericStats.stdDev / Math.abs(numericStats.mean)) * 100).toFixed(0)}%. The data is widely spread around the mean of ${numericStats.mean.toFixed(2)}.`,
          type: 'distribution',
          column: column.name,
          severity: 'info',
        });
      }
    }

    if (column.type === 'categorical') {
      const categoricalStats = stats as CategoricalStats;
      const topValue = categoricalStats.topValues[0];

      if (topValue) {
        const share = topValue.count / data.rowCount;

        if (share > 0.6) {
          insights.push({
            title: `"${column.name}" is dominated by one value`,
            description: `"${topValue.value}" appears in ${(share * 100).toFixed(0)}% of rows (${topValue.count} rows). Low diversity.`,
            type: 'distribution',
            column: column.name,
            severity: 'info',
          });
        }
      }
    }
  });

  const severityOrder = { critical: 0, warning: 1, info: 2 };
  return insights.sort((left, right) => severityOrder[left.severity] - severityOrder[right.severity]);
}

