"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-[#131b2e] mb-2">
          Terjadi Kesalahan
        </h2>
        <p className="text-[#505f76] text-sm mb-6">
          {error.message || "Terjadi kesalahan yang tidak terduga. Silakan coba lagi."}
        </p>
        {error.digest && (
          <p className="text-xs text-[#727785] font-mono bg-[#f2f3ff] rounded px-3 py-1.5 mb-6 inline-block">
            Error ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2170e4] text-white text-sm font-semibold hover:bg-[#0058be] transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
