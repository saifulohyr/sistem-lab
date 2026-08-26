"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Plus,
  Building2,
  Calendar,
  User,
  CheckCircle,
  Clock,
  Eye,
  FileCheck,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface InitialDoc {
  id: string;
  number: string;
  date: string;
  status: string;
  approvedBy: string | null;
  approvedAt: string | null;
  note: string | null;
  user: { name: string; role: string };
  room: { name: string };
  _count: { items: number };
}

export default function PendataanAwalListPage() {
  const [list, setList] = useState<InitialDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/pendataan-awal");
        const data = await res.json();
        if (data.data) setList(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Pendataan Awal Toolman</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Dokumentasi kondisi laboratorium saat toolman baru mulai bertugas
          </p>
        </div>
        <Link
          href="/dashboard/pendataan-awal/baru"
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:brightness-110 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Buat Pendataan Baru
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            Memuat dokumen pendataan...
          </div>
        ) : list.length === 0 ? (
          <div className="col-span-full py-16 text-center text-muted-foreground bg-card border border-border rounded-2xl p-8 space-y-3">
            <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground/40" />
            <h3 className="font-semibold text-foreground">Belum Ada Sesi Pendataan Awal</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Lakukan pendataan awal kondisi ruangan, PC, dan fasilitas lab untuk merekam kondisi awal saat Anda mulai bertugas.
            </p>
            <Link
              href="/dashboard/pendataan-awal/baru"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              Mulai Pendataan
            </Link>
          </div>
        ) : (
          list.map((doc) => (
            <div
              key={doc.id}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-primary px-2.5 py-1 bg-primary/10 rounded-lg">
                    {doc.number}
                  </span>
                  {doc.status === "DISAHKAN" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle className="w-3 h-3" />
                      Disahkan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="w-3 h-3" />
                      Draft
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-foreground text-lg mb-2">{doc.room.name}</h3>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Tanggal: {formatDate(doc.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    <span>Petugas: {doc.user.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>Jumlah Barang Dicek: <strong>{doc._count.items} Barang</strong></span>
                  </div>
                </div>

                {doc.note && (
                  <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border line-clamp-2">
                    {doc.note}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  {doc.approvedBy ? `Disetujui: ${doc.approvedBy}` : "Menunggu pengesahan"}
                </span>
                <Link
                  href={`/dashboard/pendataan-awal/${doc.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Lihat Detail
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
