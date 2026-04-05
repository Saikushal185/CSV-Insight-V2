import Papa from 'papaparse';

import { inferColumnType } from '@/lib/inferTypes';
import type { ColumnMeta, ParsedData } from '@/types';

const NULLISH_VALUES = new Set(['', 'null', 'na', 'n/a', 'none', '-']);

function isNullishValue(value: string): boolean {
  return NULLISH_VALUES.has(value.trim().toLowerCase());
}

function normalizeRows(rows: Record<string, unknown>[], fields: string[]): Record<string, string>[] {
  return rows.map((row) =>
    fields.reduce<Record<string, string>>((result, field) => {
      const value = row[field];
      result[field] = typeof value === 'string' ? value : value == null ? '' : String(value);
      return result;
    }, {}),
  );
}

function buildColumns(rows: Record<string, string>[], fields: string[]): ColumnMeta[] {
  return fields.map((field) => {
    const values = rows.map((row) => row[field] ?? '');
    const nonNullValues = values.filter((value) => !isNullishValue(value));
    return {
      name: field,
      type: inferColumnType(values),
      uniqueCount: new Set(nonNullValues).size,
      nullCount: values.length - nonNullValues.length,
      sampleValues: nonNullValues.slice(0, 5),
    };
  });
}

interface ParseCsvOptions {
  fileName?: string;
  parsedAt?: number;
  onProgress?: (progress: number, stage: string) => void;
}

function parseInput(input: File | string): Promise<{ rows: Record<string, string>[]; fields: string[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(input, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, errors, meta }) => {
        if (errors.length > 0) {
          reject(new Error(errors[0]?.message ?? 'CSV parsing failed.'));
          return;
        }

        const fields = (meta.fields ?? []).filter(Boolean);
        const normalizedRows = normalizeRows(data, fields);

        resolve({
          rows: normalizedRows,
          fields,
        });
      },
      error: (error) => reject(error),
    });
  });
}

export async function parseCSV(input: File | string, options: ParseCsvOptions = {}): Promise<ParsedData> {
  options.onProgress?.(20, 'Parsing CSV');
  const { rows, fields } = await parseInput(input);
  options.onProgress?.(60, 'Inferring column types');
  const columns = buildColumns(rows, fields);
  options.onProgress?.(100, 'Ready');

  return {
    rows,
    columns,
    rowCount: rows.length,
    fileName: options.fileName ?? (typeof File !== 'undefined' && input instanceof File ? input.name : 'dataset.csv'),
    parsedAt: options.parsedAt ?? Date.now(),
  };
}
