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
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #2563eb 100%)"
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Monitor className="w-8 h-8 text-blue-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">LABMUMA</h1>
              <p className="text-blue-200 text-sm">Lab Management System</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-6">
            Sistem Manajemen<br />
            <span className="text-blue-300">Inventaris & Pemeliharaan</span><br />
            Laboratorium RPL
          </h2>

          <p className="text-blue-100/80 text-lg mb-12 max-w-md">
            Kelola inventaris, perbaikan, pemeliharaan, dan peminjaman barang laboratorium dalam satu platform terintegrasi.
          </p>

          <div className="space-y-4">
            {[
              { icon: ClipboardList, text: "Pendataan & Inventaris Lengkap" },
              { icon: Wrench, text: "Perbaikan & Pemeliharaan Terlacak" },
              { icon: BarChart3, text: "Laporan Otomatis & Dashboard" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-blue-100">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5" />
                </div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
              <Monitor className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">LABMUMA</h1>
              <p className="text-muted-foreground text-xs">Lab Management System</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Masuk ke Akun</h2>
            <p className="text-muted-foreground mt-1">Silakan masuk menggunakan akun yang telah didaftarkan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm animate-scale-in">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@labmuma.id"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" className="opacity-75" />
                  </svg>
                  Memproses...
                </span>
              ) : "Masuk"}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Demo Accounts:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div><span className="font-medium text-foreground">Admin:</span> admin@labmuma.id</div>
              <div><span className="font-medium text-foreground">Pass:</span> admin123</div>
              <div><span className="font-medium text-foreground">Toolman:</span> toolman@labmuma.id</div>
              <div><span className="font-medium text-foreground">Pass:</span> toolman123</div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            LABMUMA v1.0 — Lab Management System
          </p>
        </div>
      </div>
    </div>
  );
}
