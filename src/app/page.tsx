"use client";

import Link from "next/link";
import {
  Monitor,
  Wrench,
  Users,
  Lock,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* ─── NAVBAR ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900 tracking-tight">LABMUMA</span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                Internal Lab Portal
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm">
                Login Sistem
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ──────────────────────────────────── */}
      <main className="flex-1 w-full flex flex-col py-16">
        
        {/* ─── HEADER / PORTAL INFO ────────────────────────── */}
        <section className="px-4 sm:px-6 max-w-3xl mx-auto text-center mb-16 mt-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Portal Informasi Laboratorium RPL
          </h1>
          <p className="text-base text-slate-600 leading-relaxed mb-8">
            Selamat datang di portal internal Laboratorium Rekayasa Perangkat Lunak. Sistem ini ditujukan khusus untuk pendataan inventaris, sirkulasi peminjaman alat, penjadwalan lab, serta pelaporan kerusakan secara terpusat.
          </p>
          <div className="flex justify-center">
            <Link href="/login">
              <Button size="lg" className="h-12 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm">
                Masuk ke Aplikasi
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* ─── HAK AKSES / PANDUAN INFO ────────────────────── */}
        <section className="px-4 sm:px-6 max-w-5xl mx-auto w-full">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-8 text-center border-b border-slate-100 pb-4">
              Panduan Hak Akses Pengguna
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Guru */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Guru</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Melihat ketersediaan alat, mengajukan jadwal penggunaan lab, meminjam barang untuk keperluan kelas, serta melaporkan ke teknisi apabila ada PC/alat yang bermasalah.
                  </p>
                </div>
              </div>

              {/* Toolman */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Toolman (Teknisi)</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Mendata inventaris baru, mengeksekusi perawatan rutin, menangani sirkulasi peminjaman, memproses tiket laporan perbaikan, mengesahkan pendataan awal, serta mencetak dokumen laporan resmi.
                  </p>
                </div>
              </div>

              {/* Siswa */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Siswa</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Melihat ketersediaan alat, mengecek jadwal pemakaian ruangan, serta melaporkan ke teknisi apabila ada PC/alat yang bermasalah.
                  </p>
                </div>
              </div>

              {/* Admin */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Administrator</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Mengelola akun pengguna, mengatur master data dasar (daftar ruangan, kategori, merk alat), dan memastikan sistem berjalan dengan baik.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ─── FOOTER ────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center mt-auto">
        <p className="text-xs text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} LABMUMA Internal System. Hak Cipta Dilindungi.
        </p>
      </footer>
    </div>
  );
}
