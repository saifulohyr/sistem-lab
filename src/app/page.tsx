"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Monitor,
  Package,
  Wrench,
  Calendar,
  ClipboardList,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  QrCode,
  HandCoins,
  Layers,
  BarChart3,
  Users,
  ChevronRight,
  Lock,
  ChevronDown,
  Building2,
  FileSpreadsheet,
  Clock,
  Laptop
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white font-sans overflow-x-hidden">
      {/* Background Glowing Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[10%] w-[500px] sm:w-[600px] h-[500px] sm:h-[600px] rounded-full bg-blue-600/15 blur-[140px]" />
        <div className="absolute top-[30%] right-[-10%] w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] rounded-full bg-indigo-600/15 blur-[140px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[500px] sm:w-[600px] h-[500px] sm:h-[600px] rounded-full bg-cyan-600/10 blur-[160px]" />
        {/* Subtle grid lines background overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"
        />
      </div>

      {/* ─── NAVBAR ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
              <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white">LABMUMA</span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  v1.0
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                Lab Management System
              </p>
            </div>
          </Link>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#fitur" className="hover:text-blue-400 transition-colors">Fitur Utama</a>
            <a href="#modul" className="hover:text-blue-400 transition-colors">Modul Sistem</a>
            <a href="#alur" className="hover:text-blue-400 transition-colors">Alur Kerja</a>
            <a href="#role" className="hover:text-blue-400 transition-colors">Hak Akses</a>
            <a href="#faq" className="hover:text-blue-400 transition-colors">FAQ</a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/5 rounded-xl font-medium text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-4">
                Masuk
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4">
                Dashboard
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ──────────────────────────────────── */}
      <main className="flex-1 relative z-10 w-full">
        
        {/* ─── HERO SECTION ────────────────────────────────── */}
        <section className="pt-8 sm:pt-14 pb-12 sm:pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-5 sm:mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            Sistem Informasi Manajemen Laboratorium RPL Terpadu
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight max-w-4xl mx-auto mb-4 sm:mb-5">
            Kelola Inventaris & Servis Lab Sekolah{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 block sm:inline">
              Secara Presisi & Otomatis.
            </span>
          </h1>

          <p className="text-xs sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed font-normal">
            Platform modern untuk pendataan aset, label QR Code, sirkulasi peminjaman, perbaikan teknisi, jadwal praktikum, hingga cetak Berita Acara resmi dalam hitungan detik.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 sm:mb-14">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 transition-all">
                Masuk ke Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-white font-semibold rounded-xl transition-all shadow-sm">
                Login Petugas / Guru
              </Button>
            </Link>
          </div>

          {/* Hero Interactive Glassmorphic Preview Mockup */}
          <div className="relative mx-auto max-w-4xl rounded-2xl sm:rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-white/10 to-white/0 border border-white/10 shadow-2xl shadow-blue-500/10 backdrop-blur-2xl">
            <div className="rounded-xl sm:rounded-2xl bg-slate-900/90 border border-white/5 overflow-hidden p-3.5 sm:p-6 text-left">
              {/* Window Bar */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 sm:ml-3 text-[10px] sm:text-xs font-mono text-slate-500">labmuma.app/dashboard/overview</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Database Terhubung (Online)
                </div>
              </div>

              {/* Mock Dashboard Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-3 sm:mb-4">
                <div className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span className="text-[11px] sm:text-xs">Total Inventaris</span>
                    <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-white">342 <span className="text-[10px] sm:text-xs font-normal text-slate-500">Unit</span></div>
                  <span className="text-[9px] sm:text-[10px] text-emerald-400 font-semibold block mt-0.5">+18 Pengadaan Baru</span>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span className="text-[11px] sm:text-xs">Kondisi Prima</span>
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-emerald-400">96.8%</div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 block mt-0.5">331 Barang Siap Pakai</span>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span className="text-[11px] sm:text-xs">Servis Selesai</span>
                    <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-white">48 <span className="text-[10px] sm:text-xs font-normal text-slate-500">Tiket</span></div>
                  <span className="text-[9px] sm:text-[10px] text-blue-400 font-semibold block mt-0.5">100% Ditangani</span>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span className="text-[11px] sm:text-xs">Peminjaman Aktif</span>
                    <HandCoins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-white">12 <span className="text-[10px] sm:text-xs font-normal text-slate-500">Barang</span></div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 block mt-0.5">Tenggat Terpantau</span>
                </div>
              </div>

              {/* Mock Recent Activity Row */}
              <div className="p-2.5 sm:p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold shrink-0">
                    <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-200 text-xs truncate">PC-LAB1-024 • Label QR Code Dicetak</p>
                    <p className="text-slate-500 text-[10px] sm:text-[11px] truncate">Lab Rekayasa Perangkat Lunak 1 • Toolman</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold text-[9px] sm:text-[10px] uppercase">
                    Aktif
                  </span>
                  <span className="text-slate-500 text-[10px] sm:text-[11px]">2 menit yang lalu</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── HIGHLIGHT STATS BAR ─────────────────────────── */}
        <section className="py-8 sm:py-12 border-y border-white/5 bg-slate-950/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-1">100%</div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Tracking Aset Digital Terintegrasi</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-400 mb-1">&lt; 1 Detik</div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Generasi & Cetak Label QR Code</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-1">4 Role</div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Kontrol Akses Berlapis (RBAC)</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-cyan-400 mb-1">Auto PDF</div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Berita Acara & Export Excel</p>
            </div>
          </div>
        </section>

        {/* ─── FITUR UTAMA ─────────────────────────────────── */}
        <section id="fitur" className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              KEMUDAHAN OPERASIONAL
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mt-3 sm:mt-4 mb-3 sm:mb-4">
              Dirancang Khusus untuk Kebutuhan Laboratorium SMK
            </h2>
            <p className="text-slate-400 text-sm sm:text-base md:text-lg">
              Setiap alur kerja dibuat untuk mempermudah teknisi (toolman), kepala laboratorium, guru peminjam, hingga pengelola sarana prasarana.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {/* Card 1 */}
            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-white/[0.04] transition-all group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5 sm:mb-6 group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Labeling QR Code Multi-Barang</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
                Buat kode unik otomatis per barang, cetak puluhan label QR Code sekaligus dalam ukuran stiker siap tempel di unit PC atau perangkat lab.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Cetak multi-item terpilih</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Format stiker rapi & hemat kertas</li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 hover:bg-white/[0.04] transition-all group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5 sm:mb-6 group-hover:scale-110 transition-transform">
                <Wrench className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Kanban Servis & Perbaikan</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
                Tindak lanjuti laporan kerusakan dari guru dengan papan visual kanban: Mulai dari Diagnosa, Sedang Dikerjakan, Testing, hingga Selesai.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Form Lapor Kerusakan cepat</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Catat penggantian sparepart & biaya</li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 sm:mb-6 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Berita Acara & Export Excel</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
                Cetak dokumen resmi lengkap dengan Kop Surat Sekolah dan kolom tanda tangan pengesahan, atau unduh dataset lengkap dalam format CSV/Excel.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Format cetak standar dinas / sekolah</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Unduh rekapitulasi data Excel instan</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ─── MODUL SISTEM ────────────────────────────────── */}
        <section id="modul" className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              ARSITEKTUR LENGKAP
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mt-3 sm:mt-4 mb-3 sm:mb-4">
              6 Modul Utama Terpadu
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Menghubungkan seluruh proses administratif dan teknis laboratorium dalam satu ekosistem.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Package,
                title: "Manajemen Inventaris",
                desc: "Katalog barang lengkap dengan nomor seri, spesifikasi hardware, riwayat mutasi, dan posisi rak/meja.",
                color: "text-blue-400",
                badge: "Phase 1"
              },
              {
                icon: ClipboardList,
                title: "Pendataan Awal & Ruangan",
                desc: "Inventarisasi batch awal per ruangan laboratorium dengan status verifikasi dan pengesahan Kepala Lab.",
                color: "text-indigo-400",
                badge: "Phase 1"
              },
              {
                icon: HandCoins,
                title: "Sirkulasi & Peminjaman",
                desc: "Peminjaman alat lab oleh guru/siswa dengan deteksi keterlambatan otomatis dan form berita acara pengembalian.",
                color: "text-cyan-400",
                badge: "Phase 2"
              },
              {
                icon: Wrench,
                title: "Perbaikan & Pemeliharaan",
                desc: "Tiket servis teknisi, pencatatan spareparts, serta jadwal pemeliharaan rutin (preventive) berkala.",
                color: "text-amber-400",
                badge: "Phase 3"
              },
              {
                icon: Calendar,
                title: "Jadwal Praktikum & Software",
                desc: "Manajemen jadwal pemakaian lab per kelas/guru serta tracking lisensi software yang terinstall.",
                color: "text-purple-400",
                badge: "Phase 4"
              },
              {
                icon: BarChart3,
                title: "Laporan & Rekapitulasi",
                desc: "Filter analitik berdasarkan rentang tanggal, ruangan, kondisi barang, dan export data real-time.",
                color: "text-emerald-400",
                badge: "Terintegrasi"
              },
            ].map((m, idx) => (
              <div key={idx} className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`p-2.5 sm:p-3 rounded-xl bg-white/5 ${m.color}`}>
                    <m.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                    {m.badge}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white mb-1.5 sm:mb-2">{m.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── ALUR KERJA ──────────────────────────────────── */}
        <section id="alur" className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              WORKFLOW EFISIEN
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mt-3 sm:mt-4 mb-3 sm:mb-4">
              Bagaimana LABMUMA Bekerja?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Alur kerja 4 langkah sederhana dari penerimaan hingga pelaporan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                step: "01",
                title: "Pendataan & Labeling",
                desc: "Barang masuk didata ke sistem, spesifikasi dicatat, dan stiker QR Code dicetak untuk ditempel pada unit."
              },
              {
                step: "02",
                title: "Sirkulasi & Praktikum",
                desc: "Peminjaman alat dicatat dengan batas waktu, jadwal lab disinkronkan untuk kegiatan belajar mengajar."
              },
              {
                step: "03",
                title: "Inspeksi & Perbaikan",
                desc: "Jika ada unit bermasalah, tiket dibuat di kanban servis untuk diagnosa, ganti komponen, dan pengetesan."
              },
              {
                step: "04",
                title: "Rekap & Pengesahan",
                desc: "Kepala Lab mengesahkan Berita Acara dan mencetak rekapitulasi data aset untuk pertanggungjawaban sekolah."
              }
            ].map((s, i) => (
              <div key={i} className="relative p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-blue-500/40 block mb-2 sm:mb-3 font-mono">{s.step}</span>
                  <h4 className="text-sm sm:text-base font-bold text-white mb-1.5 sm:mb-2">{s.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── HAK AKSES ROLE ──────────────────────────────── */}
        <section id="role" className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              MULTI-USER ACCESS
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mt-3 sm:mt-4 mb-3 sm:mb-4">
              Hak Akses Sesuai Tanggung Jawab
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Setiap pengguna memiliki akses antarmuka yang disesuaikan dengan perannya di sekolah.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-red-500/20">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold mb-3 sm:mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm sm:text-base text-white mb-1">Administrator</h4>
              <p className="text-[11px] sm:text-xs text-red-400 font-semibold mb-2 sm:mb-3">Full System Control</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kelola data pengguna, hak akses, master kategori, ruangan, serta hapus riwayat koreksi.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-blue-500/20">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold mb-3 sm:mb-4">
                <Wrench className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm sm:text-base text-white mb-1">Toolman (Teknisi)</h4>
              <p className="text-[11px] sm:text-xs text-blue-400 font-semibold mb-2 sm:mb-3">Operasional & Servis</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Input barang baru, sirkulasi peminjaman, cetak QR, tiket servis kanban, dan maintenance lab.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-emerald-500/20">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold mb-3 sm:mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm sm:text-base text-white mb-1">Kepala Laboratorium</h4>
              <p className="text-[11px] sm:text-xs text-emerald-400 font-semibold mb-2 sm:mb-3">Pengesahan & Monitoring</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monitoring statistik aset, pengesahan dokumen Berita Acara pendataan, dan cetak laporan resmi.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-amber-500/20">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold mb-3 sm:mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm sm:text-base text-white mb-1">Guru / Siswa</h4>
              <p className="text-[11px] sm:text-xs text-amber-400 font-semibold mb-2 sm:mb-3">Peminjaman & Lapor</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Melihat ketersediaan alat, mengajukan laporan kerusakan barang rusak, dan melihat jadwal lab.
              </p>
            </div>
          </div>
        </section>

        {/* ─── FAQ ─────────────────────────────────────────── */}
        <section id="faq" className="py-16 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto border-t border-white/5">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              PERTANYAAN UMUM
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mt-2">
              Pertanyaan Seputar Sistem LABMUMA
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {[
              {
                q: "Apakah data inventaris dapat dicetak dan diekspor ke Microsoft Excel?",
                a: "Ya. LABMUMA menyediakan fitur Export CSV (Excel) dengan standar UTF-8 BOM dan fitur cetak langsung format PDF lengkap dengan Kop Surat resmi sekolah dan tanda tangan pengesahan."
              },
              {
                q: "Bagaimana cara membuat tiket perbaikan jika ada PC atau alat lab yang rusak?",
                a: "Guru atau siswa dapat mengisi formulir Lapor Kerusakan pada modul Perbaikan. Teknisi (Toolman) akan menerima laporan tersebut dan langsung mengonversinya menjadi Tiket Servis di papan Kanban."
              },
              {
                q: "Apakah label QR Code dapat dicetak langsung banyak sekaligus?",
                a: "Tentu. Pada menu 'Cetak QR Code', Anda dapat memilih beberapa barang sekaligus dan mencetaknya dalam satu lembar stiker rapi siap potong dan tempel."
              },
              {
                q: "Apakah sistem ini mendukung jaringan lokal (Local LAN) sekolah?",
                a: "Ya. LABMUMA dapat dijalankan pada server lokal lab sekolah (LAN) maupun di-deploy ke cloud sehingga dapat diakses oleh seluruh guru dan siswa di sekolah."
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-200 hover:text-white gap-2"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${openFaq === idx ? "rotate-180 text-blue-400" : ""}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─── BOTTOM CTA BANNER ───────────────────────────── */}
        <section className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-12 md:p-16 overflow-hidden bg-gradient-to-r from-blue-900/50 via-indigo-900/40 to-slate-900/80 border border-blue-500/30 text-center shadow-2xl">
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3 sm:mb-4">
                Siap Mengoptimalkan Pengelolaan Lab RPL Sekolah Anda?
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm md:text-base mb-6 sm:mb-8">
                Akses dashboard sekarang untuk mulai mengelola inventaris barang, sirkulasi peminjaman, dan jadwal pemakaian laboratorium.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="h-11 sm:h-12 px-6 sm:px-8 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-xl shadow-lg hover:scale-105 transition-all text-xs sm:text-base w-full sm:w-auto">
                    Buka Dashboard Sekarang
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="h-11 sm:h-12 px-6 sm:px-8 bg-slate-900/80 border border-white/20 text-white hover:bg-slate-800 rounded-xl font-semibold text-xs sm:text-base w-full sm:w-auto">
                    Masuk dengan Akun Petugas
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ─── FOOTER ────────────────────────────────────────── */}
      <footer className="border-t border-white/5 bg-slate-950 py-8 sm:py-12 px-4 sm:px-6 relative z-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-200 text-xs sm:text-sm">LABMUMA</p>
              <p className="text-[10px] text-slate-500">Sistem Manajemen Laboratorium Rekayasa Perangkat Lunak</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-slate-400">
            <a href="#fitur" className="hover:text-white transition-colors">Fitur</a>
            <a href="#modul" className="hover:text-white transition-colors">Modul</a>
            <a href="#alur" className="hover:text-white transition-colors">Alur</a>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>

          <p className="text-center sm:text-right text-[11px] sm:text-xs">
            &copy; {new Date().getFullYear()} LABMUMA. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
