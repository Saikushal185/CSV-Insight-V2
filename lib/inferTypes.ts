import type { ColumnType } from '@/types';

const NULLISH_VALUES = new Set(['', 'null', 'na', 'n/a', 'none', '-']);
const NUMERIC_PATTERN = /^[-+]?(\d+(\.\d+)?|\.\d+)$/;
const DATE_PATTERN = /^(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})$/;

export function isNullValue(value: string): boolean {
  return NULLISH_VALUES.has(value.trim().toLowerCase());
}

function isNumericValue(value: string): boolean {
  const normalized = value.replace(/[$,%\s,]/g, '');

  if (!normalized || /[-/]/.test(normalized)) {
    return false;
  }

  return !Number.isNaN(parseFloat(normalized)) && NUMERIC_PATTERN.test(normalized);
}

function isDateValue(value: string): boolean {
  const normalized = value.trim();

  if (
    !normalized ||
    (!normalized.includes('-') && !normalized.includes('/')) ||
    !DATE_PATTERN.test(normalized)
  ) {
    return false;
  }

  return !Number.isNaN(new Date(normalized).getTime());
}

export function inferColumnType(values: string[]): ColumnType {
  const nonNullValues = values.filter((value) => !isNullValue(value));

  if (!nonNullValues.length) {
    return 'unknown';
  }

  const numericRatio = nonNullValues.filter(isNumericValue).length / nonNullValues.length;

  const dateRatio = nonNullValues.filter(isDateValue).length / nonNullValues.length;

  if (dateRatio >= 0.85) {
    return 'date';
  }

  if (numericRatio >= 0.85) {
    return 'numeric';
  }

  return 'categorical';
}
