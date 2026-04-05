'use client';

import { useEffect, useMemo, useState } from 'react';

import type { ParsedData } from '@/types';

export const PARSED_DATA_STORAGE_KEY = 'csv-insight-data';

export function useParsedData(): ParsedData | null {
  const [rawData, setRawData] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    return sessionStorage.getItem(PARSED_DATA_STORAGE_KEY);
  });

  useEffect(() => {
    setRawData(sessionStorage.getItem(PARSED_DATA_STORAGE_KEY));
  }, []);

  return useMemo(() => {
    if (!rawData) {
      return null;
    }

    try {
      return JSON.parse(rawData) as ParsedData;
    } catch {
      return null;
    }
  }, [rawData]);
}
