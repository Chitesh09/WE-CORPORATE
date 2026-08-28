export default function JobsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-64 bg-border-strong/50 rounded-md" />
        <div className="h-4 w-96 bg-border-subtle rounded-md" />
        <div className="h-14 w-full bg-border-subtle/60 rounded-lg" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar skeleton */}
        <div className="hidden lg:block lg:col-span-1 space-y-4">
          <div className="h-80 w-full bg-border-subtle/50 rounded-lg" />
        </div>

        {/* Feed cards skeleton */}
        <div className="lg:col-span-3 space-y-4">
          <div className="h-6 w-48 bg-border-subtle rounded-md" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 w-full bg-border-subtle/40 rounded-lg border border-border-subtle" />
          ))}
        </div>
      </div>
    </div>
  );
}
