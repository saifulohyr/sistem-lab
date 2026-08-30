"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Monitor,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  GraduationCap,
  Wrench,
  ChevronDown,
} from "lucide-react";

type LoginMode = "GURU" | "SISWA" | "STAFF";

interface UserOption {
  id: string;
  name: string;
  email: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("GURU");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // User list for Guru/Siswa dropdown
  const [userList, setUserList] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch user list when mode changes
  useEffect(() => {
    if (mode === "STAFF") {
      setUserList([]);
      setEmail("");
      return;
    }
    if (mode === "SISWA") {
      setUserList([]);
      setEmail("siswa@labmuma.id");
      return;
    }
    setEmail("");
    setLoadingUsers(true);
    fetch(`/api/users/by-role?role=GURU`)
      .then((r) => r.json())
      .then((json) => setUserList(json.data || []))
      .catch(() => setUserList([]))
      .finally(() => setLoadingUsers(false));
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email && mode !== "SISWA") {
      setError(mode === "STAFF" ? "Email wajib diisi" : "Pilih nama terlebih dahulu");
      return;
    }
    if (!password) {
      setError("Password wajib diisi");
      return;
    }

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

  const modes: { value: LoginMode; label: string; icon: typeof User; desc: string }[] = [
    { value: "GURU", label: "Guru", icon: GraduationCap, desc: "Pilih nama dari daftar" },
    { value: "SISWA", label: "Siswa", icon: User, desc: "Akses informasi Siswa" },
    { value: "STAFF", label: "Staff", icon: Wrench, desc: "Admin / Toolman" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4 sm:p-8 font-sans relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#1e40af 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Main Neobrutalism Card */}
        <div className="bg-white border-4 border-blue-900 rounded-xl p-6 sm:p-10 shadow-[8px_8px_0_0_rgba(30,64,175,1)] flex flex-col items-center">
          {/* Logo */}
          <div className="w-16 h-16 rounded-xl border-4 border-blue-900 bg-blue-500 shadow-[4px_4px_0_0_rgba(30,64,175,1)] flex items-center justify-center mb-6">
            <Monitor className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>

          <h1 className="text-3xl font-black text-blue-900 tracking-tight mb-2 uppercase">
            LABMUMA
          </h1>
          <div className="flex items-center gap-2 mb-8">
            <span className="text-white font-bold text-[10px] sm:text-xs uppercase tracking-widest px-3 py-1 bg-blue-600 border-2 border-blue-900 rounded-md shadow-[2px_2px_0_0_rgba(30,64,175,1)]">
              Portal Internal
            </span>
          </div>

          {/* Role Selector Tabs */}
          <div className="w-full grid grid-cols-3 gap-2 mb-6">
            {modes.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all text-center ${
                  mode === m.value
                    ? "border-blue-900 bg-blue-100 shadow-[3px_3px_0_0_rgba(30,64,175,1)] -translate-y-[2px] -translate-x-[1px]"
                    : "border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50"
                }`}
              >
                <m.icon
                  className={`w-5 h-5 ${mode === m.value ? "text-blue-800" : "text-blue-400"}`}
                  strokeWidth={2.5}
                />
                <span
                  className={`text-xs font-black uppercase ${
                    mode === m.value ? "text-blue-900" : "text-blue-400"
                  }`}
                >
                  {m.label}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-5">
            {error && (
              <div className="p-3 bg-red-100 border-2 border-red-700 rounded-lg text-red-800 font-bold text-sm flex items-center gap-2 shadow-[3px_3px_0_0_rgba(185,28,28,1)]">
                <span className="w-5 h-5 rounded-full bg-white border-2 border-red-700 flex items-center justify-center shrink-0 text-xs">
                  !
                </span>
                {error}
              </div>
            )}

            {/* Dynamic Input based on Mode */}
            {mode === "GURU" && (
              <div className="space-y-1.5">
                <label className="text-sm font-black text-blue-900 uppercase tracking-wide">
                  Pilih Nama Guru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-blue-800" strokeWidth={2.5} />
                  </div>
                  <select
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 bg-blue-50/50 border-2 border-blue-900 rounded-lg text-blue-900 font-bold appearance-none focus:outline-none focus:bg-white focus:shadow-[4px_4px_0_0_rgba(30,64,175,1)] focus:-translate-y-1 focus:-translate-x-1 transition-all"
                  >
                    <option value="">
                      {loadingUsers
                        ? "Memuat..."
                        : userList.length === 0
                        ? "Belum ada data"
                        : "-- Pilih Guru --"}
                    </option>
                    {userList.map((u) => (
                      <option key={u.id} value={u.email}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="w-5 h-5 text-blue-800" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            )}

            {mode === "STAFF" && (
              <div className="space-y-1.5">
                <label className="text-sm font-black text-blue-900 uppercase tracking-wide">
                  Email Staff
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-blue-800" strokeWidth={2.5} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@labmuma.id"
                    className="w-full pl-11 pr-4 py-3 bg-blue-50/50 border-2 border-blue-900 rounded-lg text-blue-900 font-bold placeholder:text-blue-300 placeholder:font-bold focus:outline-none focus:bg-white focus:shadow-[4px_4px_0_0_rgba(30,64,175,1)] focus:-translate-y-1 focus:-translate-x-1 transition-all"
                  />
                </div>
              </div>
            )}

            {mode === "SISWA" && (
              <div className="p-3 bg-blue-100 border-2 border-blue-200 rounded-lg text-blue-800 text-xs font-bold text-center flex items-center justify-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Gunakan kata sandi akses Siswa yang diberikan sekolah
              </div>
            )}

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-black text-blue-900 uppercase tracking-wide">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-blue-800" strokeWidth={2.5} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-blue-50/50 border-2 border-blue-900 rounded-lg text-blue-900 font-bold placeholder:text-blue-300 placeholder:font-bold focus:outline-none focus:bg-white focus:shadow-[4px_4px_0_0_rgba(30,64,175,1)] focus:-translate-y-1 focus:-translate-x-1 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-blue-800 hover:text-blue-500" strokeWidth={2.5} />
                  ) : (
                    <Eye className="w-5 h-5 text-blue-800 hover:text-blue-500" strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group mt-6 flex items-center justify-center gap-2 py-4 bg-blue-600 border-2 border-blue-900 rounded-lg text-white font-black text-lg uppercase tracking-wide shadow-[6px_6px_0_0_rgba(30,64,175,1)] hover:shadow-[3px_3px_0_0_rgba(30,64,175,1)] hover:translate-y-[3px] hover:translate-x-[3px] active:shadow-none active:translate-y-[6px] active:translate-x-[6px] transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-[6px_6px_0_0_rgba(30,64,175,1)] disabled:hover:translate-y-0 disabled:hover:translate-x-0"
            >
              {loading ? "Masuk..." : "Akses Sistem"}
              {!loading && (
                <ArrowRight
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  strokeWidth={3}
                />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
