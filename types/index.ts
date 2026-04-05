export type ColumnType = 'numeric' | 'categorical' | 'date' | 'unknown';

export type ChartType = 'bar' | 'line' | 'histogram' | 'scatter' | 'pie';

export interface ColumnMeta {
  name: string;
  type: ColumnType;
  uniqueCount: number;
  nullCount: number;
  sampleValues: string[];
}

export interface NumericStats {
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  q1: number;
  q3: number;
  iqr: number;
  nullCount: number;
  uniqueCount: number;
}

export interface CategoricalStats {
  uniqueCount: number;
  nullCount: number;
  topValues: { value: string; count: number }[];
  mode: string;
}

export type ColumnStats = NumericStats | CategoricalStats;

export interface ParsedData {
  rows: Record<string, string>[];
  columns: ColumnMeta[];
  rowCount: number;
  fileName: string;
  parsedAt: number;
}

export interface FilterState {
  active: Record<string, string[] | [number, number]>;
}

export interface Bin {
  range: string;
  min: number;
  max: number;
  count: number;
}

export interface InsightItem {
  title: string;
  description: string;
  type: 'outlier' | 'distribution' | 'correlation' | 'missing';
  column: string;
  severity: 'info' | 'warning' | 'critical';
}
