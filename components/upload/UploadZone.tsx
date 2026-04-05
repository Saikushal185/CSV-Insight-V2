'use client';

import { useRef, useState } from 'react';

interface UploadZoneProps {
  onFileSelected: (input: File | string, fileName?: string) => Promise<void>;
  onSampleRequested: () => Promise<void>;
  isParsing: boolean;
  error: string | null;
}

function isCsvFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.csv');
}

export function UploadZone({ onFileSelected, onSampleRequested, isParsing, error }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!isCsvFile(file)) {
      setLocalError('Please choose a .csv file.');
      return;
    }

    setLocalError(null);
    await onFileSelected(file, file.name);
  };

  return (
    <section className="rounded-[2rem] border border-zinc-200 bg-white/85 p-5 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/85">
      <div
        className={[
          'flex min-h-[420px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed px-6 py-10 text-center transition',
          isDragging
            ? 'border-blue-500 bg-blue-500/5'
            : 'border-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-800/60',
        ].join(' ')}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDrop={async (event) => {
          event.preventDefault();
          setIsDragging(false);
          await handleFile(event.dataTransfer.files?.[0]);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">
          CSV
        </div>
        <h2 className="max-w-2xl text-balance text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-100 sm:text-3xl">
          Drop your CSV here or click to browse
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          Upload any CSV file to explore interactive KPIs, linked charts, row-level table views, and rule-based
          insights with no backend involved.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
            disabled={isParsing}
            type="button"
          >
            {isParsing ? 'Parsing CSV...' : 'Choose CSV file'}
          </button>
          <button
            className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            disabled={isParsing}
            onClick={(event) => {
              event.stopPropagation();
              setLocalError(null);
              void onSampleRequested();
            }}
            type="button"
          >
            Try sample data
          </button>
        </div>

        {error || localError ? (
          <p className="mt-6 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300">
            {error ?? localError}
          </p>
        ) : null}
      </div>

      <input
        ref={inputRef}
        accept=".csv,text/csv"
        className="hidden"
        onChange={async (event) => {
          const [file] = Array.from(event.target.files ?? []);
          await handleFile(file);
          event.target.value = '';
        }}
        type="file"
      />
    </section>
  );
}
