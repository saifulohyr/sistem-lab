export default function JadwalLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="h-7 w-52 bg-[#eaedff] rounded-lg mb-2" />
          <div className="h-4 w-64 bg-[#f2f3ff] rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-[#eaedff] rounded-xl" />
          <div className="h-9 w-24 bg-[#eaedff] rounded-xl" />
          <div className="h-9 w-24 bg-[#eaedff] rounded-xl" />
        </div>
      </div>
      {/* Timeline header skeleton */}
      <div className="grid grid-cols-5 gap-1 rounded-xl overflow-hidden border border-[#eaedff]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-[#eaedff] rounded-none" />
        ))}
      </div>
      {/* Timeline rows skeleton */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="grid grid-cols-5 gap-1">
          {Array.from({ length: 5 }).map((_, j) => (
            <div key={j} className={`h-14 rounded-lg ${j === 0 ? "bg-[#f2f3ff]" : j % 2 === 0 ? "bg-[#eaedff]" : "bg-white border border-[#eaedff]"}`} />
          ))}
        </div>
      ))}
    </div>
  );
}
