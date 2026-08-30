"use client";

import { useEffect } from "react";
import { AlertTriangle, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
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
    <html lang="id">
      <body className="min-h-screen bg-[#f2f3ff] flex items-center justify-center font-sans">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 rounded-3xl bg-white border border-[#eaedff] shadow-lg flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-[#131b2e] mb-2">Oops!</h1>
          <p className="text-[#505f76] text-sm mb-8">
            Terjadi kesalahan pada sistem. Silakan muat ulang halaman atau kembali ke beranda.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-xl bg-[#2170e4] text-white text-sm font-semibold hover:bg-[#0058be] transition-colors"
            >
              Muat Ulang
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#eaedff] bg-white text-[#131b2e] text-sm font-semibold hover:bg-[#f2f3ff] transition-colors"
            >
              <Home className="w-4 h-4" />
              Beranda
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
