export default function InventarisLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="h-7 w-48 bg-[#eaedff] rounded-lg mb-2" />
          <div className="h-4 w-72 bg-[#f2f3ff] rounded" />
        </div>
        <div className="h-9 w-36 bg-[#eaedff] rounded-xl" />
      </div>
      {/* Filter bar skeleton */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-32 bg-[#f2f3ff] rounded-lg" />
        ))}
      </div>
      {/* Table skeleton */}
      <div className="rounded-xl border border-[#eaedff] bg-white overflow-hidden">
        <div className="grid grid-cols-6 px-4 py-3 border-b border-[#eaedff] gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-[#eaedff] rounded" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="grid grid-cols-6 px-4 py-3.5 gap-4 border-b border-[#f2f3ff]">
            {Array.from({ length: 6 }).map((_, j) => (
              <div key={j} className="h-4 bg-[#f2f3ff] rounded" style={{ width: `${60 + (j * 10) % 40}%` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
