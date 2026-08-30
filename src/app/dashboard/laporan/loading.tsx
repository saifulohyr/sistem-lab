export default function LaporanLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="h-7 w-52 bg-[#eaedff] rounded-lg mb-2" />
          <div className="h-4 w-64 bg-[#f2f3ff] rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-32 bg-[#eaedff] rounded-xl" />
          <div className="h-9 w-32 bg-[#eaedff] rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter panel skeleton */}
        <div className="lg:col-span-1 rounded-xl border border-[#eaedff] bg-white p-5 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-20 bg-[#eaedff] rounded mb-2" />
              <div className="h-10 w-full bg-[#f2f3ff] rounded-lg" />
            </div>
          ))}
        </div>
        {/* Report preview skeleton */}
        <div className="lg:col-span-3 rounded-xl border border-[#eaedff] bg-white p-8 space-y-6">
          <div className="text-center space-y-2 border-b border-[#eaedff] pb-6">
            <div className="h-5 w-2/3 bg-[#eaedff] rounded mx-auto" />
            <div className="h-4 w-1/2 bg-[#f2f3ff] rounded mx-auto" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-[#f2f3ff] rounded-lg" />
            ))}
          </div>
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 bg-[#f2f3ff] rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
