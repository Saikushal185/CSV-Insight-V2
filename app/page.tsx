'use client';

import { startTransition, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ParseProgress } from '@/components/upload/ParseProgress';
import { UploadZone } from '@/components/upload/UploadZone';
import { PARSED_DATA_STORAGE_KEY } from '@/hooks/useParsedData';
import { parseCSV } from '@/lib/parseCSV';
import { useFilterStore } from '@/store/filterStore';
import type { ParsedData } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Waiting for a file');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persistAndRoute = (parsedData: ParsedData) => {
    sessionStorage.setItem(PARSED_DATA_STORAGE_KEY, JSON.stringify(parsedData));
    useFilterStore.getState().clearAll();

    startTransition(() => {
      router.push('/dashboard');
    });
  };

  const handleParse = async (input: File | string, fileName?: string) => {
    setIsParsing(true);
    setError(null);
    setProgress(8);
    setStage('Preparing dataset');

    try {
      const parsedData = await parseCSV(input, {
        fileName,
        onProgress: (nextProgress, nextStage) => {
          setProgress(nextProgress);
          setStage(nextStage);
        },
      });

      persistAndRoute(parsedData);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to parse this CSV file.');
      setProgress(0);
      setStage('Waiting for a file');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSample = async () => {
    setIsParsing(true);
    setError(null);
    setProgress(6);
    setStage('Loading sample dataset');

    try {
      const response = await fetch('/sample.csv');

      if (!response.ok) {
        throw new Error('Unable to load the sample dataset.');
      }

      const csvText = await response.text();
      await handleParse(csvText, 'sample.csv');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load the sample dataset.');
      setIsParsing(false);
      setProgress(0);
      setStage('Waiting for a file');
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-10 top-10 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 lg:flex-row lg:items-center">
        <div className="max-w-xl space-y-5">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">CSV Insight Studio v2</p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-100 sm:text-5xl">
            Cross-filtered analytics that stay entirely in your browser.
          </h1>
          <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300 sm:text-base">
            Upload a CSV and move through an overview dashboard, profile views, a full table, and auto-generated
            insights. Every chart interaction filters the rest of the workspace instantly.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white/80 p-4 dark:border-zinc-700 dark:bg-zinc-900/70">
              <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Cross-filtering</p>
              <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">Bar, pie, scatter, line, and histogram interactions.</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white/80 p-4 dark:border-zinc-700 dark:bg-zinc-900/70">
              <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Persistence</p>
              <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">Datasets survive refreshes through session storage.</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white/80 p-4 dark:border-zinc-700 dark:bg-zinc-900/70">
              <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Insights</p>
              <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">Rule-based anomalies and distribution alerts out of the box.</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <UploadZone error={error} isParsing={isParsing} onFileSelected={handleParse} onSampleRequested={handleSample} />
          <ParseProgress isVisible={isParsing || progress > 0} progress={progress} stage={stage} />
        </div>
      </div>
    </main>
  );
}
