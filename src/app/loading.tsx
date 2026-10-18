// app/loading.tsx — streamed instantly on navigation while the next page renders (PRF-2: never a dead screen).
export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="flex animate-pulse flex-col gap-4">
      <div className="h-10 w-2/3 rounded-lg bg-surface-2" />
      <div className="h-4 w-full rounded bg-surface-2" />
      <div className="h-4 w-5/6 rounded bg-surface-2" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="min-h-[116px] rounded-card border border-border bg-surface p-5 space-y-2">
            <div className="h-5 w-1/2 rounded bg-surface-2" />
            <div className="h-4 w-5/6 rounded bg-surface-2/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
