"use client";

import Link from "next/link";
import {
  Package,
  Wrench,
  PackagePlus,
  PackageMinus,
  Calendar,
  AlertTriangle,
  QrCode,
  ArrowRight,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  History,
  Building2,
  Tag,
} from "lucide-react";

interface DashboardProps {
  stats: {
    total: number;
    baik: number;
    rusakRingan: number;
    rusakBerat: number;
    tidakDitemukan: number;
    activeRepairs: number;
    outgoingCount: number;
    scheduleCount: number;
    repairWaiting: number;
    repairInProgress: number;
    repairCompleted: number;
  };
  categoryData: { name: string; count: number }[];
  roomData: { name: string; count: number }[];
  schedules: {
    id: string;
    subject: string;
    teacher: string;
    className: string;
    startTime: string;
    endTime: string;
    roomName: string;
  }[];
  recentHistory: {
    id: string;
    action: string;
    description: string;
    createdAt: string;
    inventoryCode: string;
    inventoryName: string;
    userName: string;
  }[];
  userName: string;
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 60) return "Baru saja";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} hari lalu`;
}

export default function DashboardClient({
  stats,
  categoryData,
  roomData,
  schedules,
  recentHistory,
  userName,
}: DashboardProps) {
  const totalTickets = (stats.repairWaiting + stats.repairInProgress + stats.repairCompleted) || 1;
  const waitingPct = Math.round((stats.repairWaiting / totalTickets) * 100);
  const inProgressPct = Math.round((stats.repairInProgress / totalTickets) * 100);

  const todayFormatted = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="flex flex-col w-full gap-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#131b2e] tracking-tight">
            Ringkasan Laboratorium
          </h1>
          <p className="text-xs sm:text-sm text-[#505f76] mt-1">
            Selamat datang, <span className="font-semibold text-[#131b2e]">{userName}</span>. Pantau status inventaris, aktivitas, dan pemeliharaan hari ini.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full md:w-auto">
          <Link
            href="/dashboard/laporan"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white hover:bg-[#f2f3ff] text-[#131b2e] text-xs sm:text-sm font-semibold rounded-lg border border-[#eaedff] shadow-sm transition-all group"
          >
            <Package className="w-4 h-4 text-[#0058be] group-hover:scale-110 transition-transform" />
            Rekap Laporan
          </Link>
          <Link
            href="/dashboard/inventaris/tambah"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white hover:bg-[#f2f3ff] text-[#131b2e] text-xs sm:text-sm font-semibold rounded-lg border border-[#eaedff] shadow-sm transition-all group"
          >
            <PackagePlus className="w-4 h-4 text-[#0058be] group-hover:scale-110 transition-transform" />
            Input Barang
          </Link>
          <Link
            href="/dashboard/perbaikan/tiket-baru"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0058be] hover:bg-[#2170e4] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all group"
          >
            <Wrench className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Buat Tiket
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#eaedff] shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-[#0058be]/10 flex items-center justify-center text-[#0058be]">
              <Package className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 bg-[#f2f3ff] text-[#0058be] px-2.5 py-0.5 rounded-full text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Total</span>
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-[#131b2e] mb-1 font-mono tracking-tight">{stats.total}</h3>
            <p className="text-[11px] font-bold text-[#505f76] uppercase tracking-wider">Total Inventaris</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#eaedff] shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-red-100">
              <AlertTriangle className="w-3 h-3" />
              <span>{stats.activeRepairs} Aktif</span>
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-[#131b2e] mb-1 font-mono tracking-tight">{stats.activeRepairs}</h3>
            <p className="text-[11px] font-bold text-[#505f76] uppercase tracking-wider">Tiket Perbaikan Aktif</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#eaedff] shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <PackageMinus className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 bg-[#f2f3ff] text-[#0058be] px-2.5 py-0.5 rounded-full text-xs font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-[#131b2e] mb-1 font-mono tracking-tight">{stats.outgoingCount}</h3>
            <p className="text-[11px] font-bold text-[#505f76] uppercase tracking-wider">Barang Keluar (Bulan Ini)</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0058be] to-[#2170e4] text-white rounded-xl p-5 sm:p-6 shadow-md relative overflow-hidden group hover:shadow-lg transition-all">
          <svg className="absolute -right-6 -bottom-6 w-36 h-36 text-white/10 group-hover:scale-110 transition-transform duration-700 ease-out animate-[spin_12s_linear_infinite]" fill="currentColor" viewBox="0 0 100 100">
            <circle cx="50" cy="50" fill="none" r="38" stroke="currentColor" strokeDasharray="4 4" strokeWidth="2" />
            <circle cx="50" cy="50" fill="none" opacity="0.4" r="22" stroke="currentColor" strokeWidth="8" />
          </svg>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-white/90">
              Hari Ini
            </span>
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-white mb-1 font-mono tracking-tight">{stats.scheduleCount}</h3>
            <p className="text-[11px] font-bold text-blue-100 uppercase tracking-wider">Sesi Penggunaan Lab</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#eaedff] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base sm:text-lg font-bold text-[#131b2e] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0058be]" />
                Status Pemeliharaan & Tiket
              </h2>
              <Link href="/dashboard/perbaikan" className="text-xs font-bold text-[#0058be] hover:underline flex items-center gap-1">
                Lihat Semua Tiket <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
              <div className="relative w-36 h-36 sm:w-40 sm:h-40 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#eaedff]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="100, 100"
                    strokeWidth="3.5"
                  />
                  <path
                    className="text-[#0058be]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray={`${waitingPct}, 100`}
                    strokeWidth="3.5"
                  />
                  <path
                    className="text-red-500"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray={`${inProgressPct}, 100`}
                    strokeDashoffset={`-${waitingPct}`}
                    strokeWidth="3.5"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-[#131b2e] leading-none">
                    {stats.repairWaiting + stats.repairInProgress + stats.repairCompleted}
                  </span>
                  <span className="text-[10px] font-semibold text-[#505f76] uppercase tracking-wider mt-0.5">Total Tiket</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-2.5">
                <div className="flex justify-between items-center bg-[#f2f3ff] px-4 py-2.5 rounded-lg border-l-4 border-[#0058be]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0058be]" />
                    <span className="text-xs sm:text-sm font-medium text-[#131b2e]">Menunggu Penanganan</span>
                  </div>
                  <span className="text-sm font-bold text-[#131b2e] font-mono">{stats.repairWaiting}</span>
                </div>

                <div className="flex justify-between items-center bg-[#f2f3ff] px-4 py-2.5 rounded-lg border-l-4 border-red-500">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-xs sm:text-sm font-medium text-[#131b2e]">Sedang Dikerjakan</span>
                  </div>
                  <span className="text-sm font-bold text-[#131b2e] font-mono">{stats.repairInProgress}</span>
                </div>

                <div className="flex justify-between items-center bg-[#f2f3ff] px-4 py-2.5 rounded-lg border-l-4 border-emerald-500">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs sm:text-sm font-medium text-[#131b2e]">Selesai Diperbaiki</span>
                  </div>
                  <span className="text-sm font-bold text-[#131b2e] font-mono">{stats.repairCompleted}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#eaedff] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base sm:text-lg font-bold text-[#131b2e] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0058be]" />
                Jadwal Laboratorium
              </h2>
              <div className="text-xs font-bold bg-[#f2f3ff] text-[#0058be] px-3 py-1 rounded-full border border-[#eaedff]">
                {todayFormatted}
              </div>
            </div>

            {schedules.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#eaedff]">
                {schedules.map((s, idx) => (
                  <div key={s.id || idx} className="relative group">
                    <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-[#0058be] shadow-sm" />
                    <div className="bg-[#f2f3ff] hover:bg-[#eaedff] p-3.5 sm:p-4 rounded-xl border border-[#eaedff] transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-mono font-bold text-[#0058be]">{s.startTime} - {s.endTime} WIB</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white text-[#505f76] self-start sm:self-auto border border-[#eaedff]">
                          {s.roomName}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#131b2e]">{s.subject}</h4>
                      <p className="text-xs text-[#505f76] mt-0.5 flex items-center gap-2">
                        <span>Kelas: <strong className="text-[#131b2e]">{s.className}</strong></span>
                        <span>•</span>
                        <span>Guru: <strong className="text-[#131b2e]">{s.teacher}</strong></span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-[#f2f3ff] rounded-xl border border-dashed border-[#c2c6d6]">
                <Calendar className="w-8 h-8 text-[#505f76] mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-[#131b2e]">Belum ada jadwal sesi hari ini</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#eaedff] shadow-[0_1px_3px_rgba(0,0,0,0.02)] h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-base sm:text-lg font-bold text-[#131b2e] flex items-center gap-2">
                  <History className="w-5 h-5 text-[#0058be]" />
                  Aktivitas Terbaru
                </h2>
              </div>
              <div className="space-y-3.5">
                {recentHistory.map((item, idx) => (
                  <div key={item.id || idx} className="flex gap-3 items-start p-2.5 rounded-lg hover:bg-[#f2f3ff] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[#0058be]/10 text-[#0058be] flex items-center justify-center shrink-0 mt-0.5">
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#131b2e] truncate">{item.inventoryCode || item.action}</p>
                      <p className="text-xs text-[#505f76] line-clamp-2 mt-0.5 leading-relaxed">{item.description || item.action}</p>
                      <p className="text-[10px] text-[#727785] mt-1 font-mono">{timeAgo(item.createdAt)}</p>
                    </div>
                  </div>
                ))}
                {recentHistory.length === 0 && (
                  <div className="text-center py-8 text-xs text-[#727785]">Belum ada riwayat tercatat.</div>
                )}
              </div>
            </div>
            <Link href="/dashboard/laporan" className="w-full mt-6 py-2.5 border border-[#eaedff] hover:bg-[#f2f3ff] rounded-lg text-xs font-bold text-[#0058be] text-center transition-colors block">
              Tampilkan Riwayat Lengkap
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#eaedff] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <h3 className="text-sm font-bold text-[#131b2e] mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#0058be]" />
            Distribusi Kondisi Inventaris
          </h3>
          <div className="grid grid-cols-2 gap-2 text-center mb-4">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <span className="text-xl font-black text-emerald-700">{stats.baik}</span>
              <p className="text-[10px] uppercase font-bold text-emerald-800">Baik</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <span className="text-xl font-black text-amber-700">{stats.rusakRingan}</span>
              <p className="text-[10px] uppercase font-bold text-amber-800">Rusak Ringan</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
              <span className="text-xl font-black text-red-700">{stats.rusakBerat}</span>
              <p className="text-[10px] uppercase font-bold text-red-800">Rusak Berat</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xl font-black text-slate-700">{stats.tidakDitemukan}</span>
              <p className="text-[10px] uppercase font-bold text-slate-800">Hilang</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#eaedff] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <h3 className="text-sm font-bold text-[#131b2e] mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0058be]" />
            Inventaris Per Ruangan
          </h3>
          {roomData.length > 0 ? (
            <div className="space-y-2.5">
              {roomData.slice(0, 4).map((r, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-[#f2f3ff] rounded-lg text-xs">
                  <span className="font-semibold text-[#131b2e]">{r.name}</span>
                  <span className="font-bold font-mono px-2 py-0.5 rounded bg-white text-[#0058be] border border-[#eaedff]">{r.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-[#727785]">Belum ada data ruangan.</div>
          )}
        </div>
      </div>
    </div>
  );
}
