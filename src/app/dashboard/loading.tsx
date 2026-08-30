export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="h-7 w-48 bg-[#eaedff] rounded-lg mb-2" />
          <div className="h-4 w-72 bg-[#f2f3ff] rounded" />
        </div>
        <div className="h-9 w-32 bg-[#eaedff] rounded-xl" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[#eaedff] bg-white p-5">
            <div className="h-4 w-20 bg-[#f2f3ff] rounded mb-3" />
            <div className="h-8 w-16 bg-[#eaedff] rounded-lg mb-1" />
            <div className="h-3 w-24 bg-[#f2f3ff] rounded" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-[#eaedff] bg-white overflow-hidden">
        <div className="p-4 border-b border-[#eaedff]">
          <div className="h-5 w-40 bg-[#eaedff] rounded" />
        </div>
        <div className="divide-y divide-[#f2f3ff]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-4">
              <div className="h-9 w-9 bg-[#f2f3ff] rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-[#eaedff] rounded w-1/3" />
                <div className="h-3 bg-[#f2f3ff] rounded w-1/2" />
              </div>
              <div className="h-6 w-16 bg-[#f2f3ff] rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
