export default function ReportLoading() {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 flex flex-col gap-6 animate-pulse">
      <div className="h-32 rounded-2xl bg-surface-2 border border-border" />
      <div className="h-48 rounded-2xl bg-surface-2 border border-border" />
      <div className="h-64 rounded-2xl bg-surface-2 border border-border" />
    </div>
  );
}
