import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { applyFilters } from '@/lib/applyFilters';
import { computeBins } from '@/lib/binning';
import { computeColumnStats } from '@/lib/computeStats';
import { generateInsights } from '@/lib/generateInsights';
import { inferColumnType, isNullValue } from '@/lib/inferTypes';
import { parseCSV } from '@/lib/parseCSV';
import { suggestDashboardCharts } from '@/lib/suggestCharts';
import type { ColumnMeta, ParsedData } from '@/types';

const parsedAt = 1704067200000;

const rows = [
  {
    order_id: 'ORD-0001',
    order_date: '2024-01-05',
    customer_region: 'North',
    product_category: 'Electronics',
    product_name: 'Wireless Headphones',
    quantity: '2',
    unit_price: '89.99',
    total_revenue: '179.98',
    is_returned: 'No',
  },
  {
    order_id: 'ORD-0002',
    order_date: '2024-01-09',
    customer_region: 'South',
    product_category: 'Books',
    product_name: 'Deep Work Daily',
    quantity: '',
    unit_price: '19.50',
    total_revenue: '',
    is_returned: 'No',
  },
  {
    order_id: 'ORD-0003',
    order_date: '2024-02-11',
    customer_region: 'North',
    product_category: 'Electronics',
    product_name: 'Smartwatch',
    quantity: '10',
    unit_price: '310.00',
    total_revenue: '3100.00',
    is_returned: 'Yes',
  },
  {
    order_id: 'ORD-0004',
    order_date: '2024-02-15',
    customer_region: 'West',
    product_category: 'Food',
    product_name: 'Protein Bars',
    quantity: '4',
    unit_price: '12.50',
    total_revenue: '50.00',
    is_returned: 'No',
  },
];

const columns: ColumnMeta[] = [
  { name: 'order_id', type: 'categorical', uniqueCount: 4, nullCount: 0, sampleValues: ['ORD-0001', 'ORD-0002'] },
  { name: 'order_date', type: 'date', uniqueCount: 4, nullCount: 0, sampleValues: ['2024-01-05', '2024-01-09'] },
  { name: 'customer_region', type: 'categorical', uniqueCount: 3, nullCount: 0, sampleValues: ['North', 'South'] },
  { name: 'product_category', type: 'categorical', uniqueCount: 3, nullCount: 0, sampleValues: ['Electronics', 'Books'] },
  { name: 'product_name', type: 'categorical', uniqueCount: 4, nullCount: 0, sampleValues: ['Wireless Headphones'] },
  { name: 'quantity', type: 'numeric', uniqueCount: 3, nullCount: 1, sampleValues: ['2', '10', '4'] },
  { name: 'unit_price', type: 'numeric', uniqueCount: 4, nullCount: 0, sampleValues: ['89.99', '19.50'] },
  { name: 'total_revenue', type: 'numeric', uniqueCount: 3, nullCount: 1, sampleValues: ['179.98', '3100.00'] },
  { name: 'is_returned', type: 'categorical', uniqueCount: 2, nullCount: 0, sampleValues: ['No', 'Yes'] },
];

const parsedData: ParsedData = {
  rows,
  columns,
  rowCount: rows.length,
  fileName: 'orders.csv',
  parsedAt,
};

describe('inferTypes', () => {
  it('recognizes null values used by the app', () => {
    expect(isNullValue('')).toBe(true);
    expect(isNullValue('N/A')).toBe(true);
    expect(isNullValue('none')).toBe(true);
    expect(isNullValue('-')).toBe(true);
    expect(isNullValue('North')).toBe(false);
  });

  it('infers numeric, date, categorical, and unknown columns', () => {
    expect(inferColumnType(['$10.00', '20%', '30', '40', ''])).toBe('numeric');
    expect(inferColumnType(['2024-01-01', '2024/02/01', '2024-03-05', ''])).toBe('date');
    expect(inferColumnType(['North', 'South', 'West'])).toBe('categorical');
    expect(inferColumnType(['', 'null', 'na', 'N/A', '-'])).toBe('unknown');
  });
});

describe('applyFilters', () => {
  it('applies categorical, numeric, and date range filters together', () => {
    const filtered = applyFilters(rows, {
      customer_region: ['North'],
      quantity: [2, 10],
      order_date: [Date.parse('2024-01-01'), Date.parse('2024-02-01')],
    });

    expect(filtered).toEqual([rows[0]]);
  });

  it('returns all rows when no filters are active', () => {
    expect(applyFilters(rows, {})).toEqual(rows);
  });
});

describe('computeBins', () => {
  it('creates sturges bins for a numeric series', () => {
    const bins = computeBins([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

    expect(bins.length).toBeGreaterThanOrEqual(5);
    expect(bins.length).toBeLessThanOrEqual(20);
    expect(bins.reduce((sum, bin) => sum + bin.count, 0)).toBe(12);
  });

  it('handles identical values as a single bucket', () => {
    expect(computeBins([5, 5, 5])).toEqual([{ range: '5', min: 5, max: 5, count: 3 }]);
  });
});

describe('computeColumnStats', () => {
  it('computes numeric stats including quartiles and std dev', () => {
    const stats = computeColumnStats(columns[5], rows);

    expect(stats).toMatchObject({
      mean: 16 / 3,
      median: 4,
      min: 2,
      max: 10,
      q1: 3,
      q3: 7,
      iqr: 4,
      nullCount: 1,
      uniqueCount: 3,
    });
    expect('stdDev' in stats && stats.stdDev).toBeGreaterThan(0);
  });

  it('computes categorical stats with top values and mode', () => {
    const stats = computeColumnStats(columns[2], rows);

    expect(stats).toMatchObject({
      uniqueCount: 3,
      nullCount: 0,
      mode: 'North',
    });
    expect('topValues' in stats && stats.topValues[0]).toEqual({ value: 'North', count: 2 });
  });
});

describe('parseCSV', () => {
  it('returns v2 parsed data with metadata and sample values', async () => {
    const csv = [
      'order_id,order_date,customer_region,product_category,product_name,quantity,unit_price,total_revenue,is_returned',
      'ORD-0001,2024-01-05,North,Electronics,Wireless Headphones,2,89.99,179.98,No',
      'ORD-0002,2024-01-09,South,Books,Deep Work Daily,,19.50,,No',
      'ORD-0003,2024-02-11,North,Electronics,Smartwatch,10,310.00,3100.00,Yes',
    ].join('\n');

    const parsed = await parseCSV(csv, { fileName: 'orders.csv', parsedAt });

    expect(parsed.fileName).toBe('orders.csv');
    expect(parsed.parsedAt).toBe(parsedAt);
    expect(parsed.rowCount).toBe(3);
    expect(parsed.columns.map((column) => [column.name, column.type, column.nullCount])).toEqual([
      ['order_id', 'categorical', 0],
      ['order_date', 'date', 0],
      ['customer_region', 'categorical', 0],
      ['product_category', 'categorical', 0],
      ['product_name', 'categorical', 0],
      ['quantity', 'numeric', 1],
      ['unit_price', 'numeric', 0],
      ['total_revenue', 'numeric', 1],
      ['is_returned', 'categorical', 0],
    ]);
    expect(parsed.columns.find((column) => column.name === 'product_name')?.sampleValues).toEqual([
      'Wireless Headphones',
      'Deep Work Daily',
      'Smartwatch',
    ]);
  });
});

describe('suggestDashboardCharts', () => {
  it('picks the overview chart candidates from available columns', () => {
    const suggestions = suggestDashboardCharts(columns);

    expect(suggestions.barColumn?.name).toBe('order_id');
    expect(suggestions.pieColumn?.name).toBe('customer_region');
    expect(suggestions.lineColumn?.name).toBe('order_date');
    expect(suggestions.scatterCols?.map((column) => column.name)).toEqual(['quantity', 'unit_price']);
  });
});

describe('generateInsights', () => {
  it('creates missing, outlier, and distribution insights', () => {
    const insightsData: ParsedData = {
      ...parsedData,
      rows: [
        ...rows,
        {
          order_id: 'ORD-0005',
          order_date: '2024-02-18',
          customer_region: 'North',
          product_category: 'Electronics',
          product_name: '4K Monitor',
          quantity: '1',
          unit_price: '20000.00',
          total_revenue: '20000.00',
          is_returned: 'No',
        },
        {
          order_id: 'ORD-0006',
          order_date: '2024-02-20',
          customer_region: 'North',
          product_category: 'Electronics',
          product_name: 'Laptop Dock',
          quantity: '1',
          unit_price: '75.00',
          total_revenue: '75.00',
          is_returned: 'No',
        },
        {
          order_id: 'ORD-0007',
          order_date: '2024-02-21',
          customer_region: 'North',
          product_category: 'Electronics',
          product_name: 'Wireless Charger',
          quantity: '',
          unit_price: '35.00',
          total_revenue: '',
          is_returned: 'No',
        },
        {
          order_id: 'ORD-0008',
          order_date: '2024-02-22',
          customer_region: 'North',
          product_category: 'Electronics',
          product_name: 'USB-C Hub',
          quantity: '',
          unit_price: '45.00',
          total_revenue: '',
          is_returned: 'No',
        },
      ],
      rowCount: 8,
    };

    const insights = generateInsights(insightsData);

    expect(insights.length).toBeGreaterThanOrEqual(3);
    expect(insights.some((item) => item.type === 'missing' && item.column === 'quantity')).toBe(true);
    expect(insights.some((item) => item.type === 'outlier' && item.column === 'total_revenue')).toBe(true);
    expect(insights.some((item) => item.type === 'distribution')).toBe(true);
  });

  it('produces at least three insights for the bundled sample dataset', async () => {
    const samplePath = path.join(process.cwd(), 'public', 'sample.csv');
    const sampleCsv = readFileSync(samplePath, 'utf8');
    const sampleData = await parseCSV(sampleCsv, { fileName: 'sample.csv', parsedAt });
    const insights = generateInsights(sampleData);

    expect(insights.length).toBeGreaterThanOrEqual(3);
  });
});
