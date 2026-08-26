"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Monitor,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Wrench,
  BarChart3,
  ClipboardList,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login gagal");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950">
        {/* Abstract shapes matching MCP premium aesthetic */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-20 text-white w-full">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Monitor className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">LABMUMA</h1>
              <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest">Lab System</p>
            </div>
          </div>

          <h2 className="text-5xl font-black leading-[1.1] mb-6 tracking-tight text-white">
            Sistem Manajemen<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">Inventaris & Pemeliharaan</span><br />
            Laboratorium RPL
          </h2>

          <p className="text-slate-300 text-lg mb-12 max-w-lg leading-relaxed">
            Kelola inventaris, perbaikan, pemeliharaan, dan peminjaman barang laboratorium dalam satu platform terintegrasi.
          </p>

          <div className="space-y-5">
            {[
              { icon: ClipboardList, text: "Pendataan & Inventaris Lengkap" },
              { icon: Wrench, text: "Perbaikan & Pemeliharaan Terlacak" },
              { icon: BarChart3, text: "Laporan Otomatis & Dashboard" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-slate-200">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-inner">
                  <item.icon className="w-5 h-5 text-blue-400" />
                </div>
                <span className="font-medium text-lg">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-slate-50 relative">
        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 sm:gap-4 mb-8 sm:mb-10 justify-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Monitor className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">LABMUMA</h1>
              <p className="text-blue-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Lab System</p>
            </div>
          </div>

          <div className="mb-6 sm:mb-10 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Masuk ke Akun</h2>
            <p className="text-slate-500 mt-1.5 sm:mt-2 text-xs sm:text-sm font-medium">Silakan masuk menggunakan akun terdaftar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="p-3 sm:p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs sm:text-sm font-medium animate-scale-in flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-red-600 text-xs font-bold">!</span>
                </div>
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">Email</label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 z-10 flex items-center justify-center">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@labmuma.id"
                  required
                  style={{ paddingLeft: "2.75rem" }}
                  className="w-full pr-4 py-3 sm:py-3.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">Password</label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 z-10 flex items-center justify-center">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                  className="w-full py-3 sm:py-3.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 z-10 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 mt-2 rounded-xl bg-blue-600 text-white font-bold text-sm sm:text-base hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4 sm:w-5 sm:h-5 text-white/70" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" className="opacity-75" />
                  </svg>
                  Memproses...
                </span>
              ) : "Masuk ke Sistem"}
            </button>
          </form>

          <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">Akun Demo (Klik untuk Isi)</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => { setEmail("admin@labmuma.id"); setPassword("admin123"); }}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
              >
                <span className="font-bold text-slate-700 block">Admin</span>
                <span className="text-slate-500 text-[11px] truncate block">admin@labmuma.id</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail("toolman@labmuma.id"); setPassword("toolman123"); }}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
              >
                <span className="font-bold text-slate-700 block">Toolman</span>
                <span className="text-slate-500 text-[11px] truncate block">toolman@labmuma.id</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail("kepalalab@labmuma.id"); setPassword("kepalalab123"); }}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
              >
                <span className="font-bold text-slate-700 block">Kepala Lab</span>
                <span className="text-slate-500 text-[11px] truncate block">kepalalab@labmuma.id</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail("guru@labmuma.id"); setPassword("guru123"); }}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
              >
                <span className="font-bold text-slate-700 block">Guru</span>
                <span className="text-slate-500 text-[11px] truncate block">guru@labmuma.id</span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs font-medium text-slate-400 mt-6">
            LABMUMA v1.0 — Lab Management System
          </p>
        </div>
      </div>
    </div>
  );
}
