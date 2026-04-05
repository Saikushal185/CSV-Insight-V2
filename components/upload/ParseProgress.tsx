'use client';

interface ParseProgressProps {
  progress: number;
  stage: string;
  isVisible: boolean;
}

export function ParseProgress({ progress, stage, isVisible }: ParseProgressProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{stage}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Browser-side parsing and type inference
          </p>
        </div>
        <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">{Math.round(progress)}%</p>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${Math.max(4, progress)}%` }}
        />
      </div>
    </section>
  );
}

