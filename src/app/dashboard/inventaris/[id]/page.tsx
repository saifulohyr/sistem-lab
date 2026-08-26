"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Cpu,
  History,
  QrCode,
  MapPin,
  Calendar,
  Building2,
  Tag,
  DollarSign,
  FileText,
  Clock,
  Printer,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { formatDate, getConditionLabel, getStatusLabel } from "@/lib/utils";

interface InventoryDetail {
  id: string;
  code: string;
  name: string;
  type: string | null;
  serialNumber: string | null;
  year: number | null;
  source: string | null;
  price: number | null;
  documentNo: string | null;
  position: string | null;
  condition: string;
  status: string;
  quantity: number;
  note: string | null;
  createdAt: string;
  category: { id: string; name: string };
  brand: { id: string; name: string } | null;
  room: { id: string; name: string } | null;
  specs: { id: string; key: string; value: string }[];
  history: {
    id: string;
    action: string;
    description: string;
    createdAt: string;
    user: { name: string; role: string } | null;
  }[];
}

export default function DetailInventarisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [item, setItem] = useState<InventoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "specs" | "history" | "qr">("info");

  useEffect(() => {
    async function loadDetail() {
      try {
        const res = await fetch(`/api/inventaris/${id}`);
        const data = await res.json();
        if (data.data) {
          setItem(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  const handleDelete = async () => {
    if (!item) return;
    if (!confirm(`Yakin ingin menghapus inventaris ${item.code}?`)) return;
    try {
      const res = await fetch(`/api/inventaris/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/inventaris");
      } else {
        const d = await res.json();
        alert(d.error || "Gagal menghapus");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <svg className="animate-spin w-8 h-8 text-primary mx-auto mb-2" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" className="opacity-75" />
        </svg>
        Memuat detail inventaris...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="py-20 text-center text-muted-foreground space-y-3">
        <p>Barang inventaris tidak ditemukan.</p>
        <Link href="/dashboard/inventaris" className="text-primary hover:underline text-sm">
          Kembali ke daftar inventaris
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/inventaris"
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs sm:text-sm font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-md shrink-0">
                {item.code}
              </span>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">{item.name}</h1>
            </div>
            <p className="text-muted-foreground text-xs mt-0.5">
              Ditambahkan pada {formatDate(item.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Label
          </button>
          <Link
            href={`/dashboard/inventaris/${item.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto">
        {[
          { key: "info", label: "Informasi Utama", icon: Package },
          { key: "specs", label: `Spesifikasi (${item.specs.length})`, icon: Cpu },
          { key: "history", label: `Riwayat (${item.history.length})`, icon: History },
          { key: "qr", label: "QR Label", icon: QrCode },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Info */}
      {activeTab === "info" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Status & Lokasi */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              Status & Penempatan
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block mb-0.5">Kondisi Fisik</span>
                <span className="font-semibold text-foreground">{getConditionLabel(item.condition)}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-0.5">Status Barang</span>
                <span className="font-semibold text-foreground">{getStatusLabel(item.status)}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-0.5">Ruangan</span>
                <span className="font-medium text-foreground">{item.room?.name || "-"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-0.5">Posisi Meja/Rak</span>
                <span className="font-medium text-foreground">{item.position || "-"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-0.5">Jumlah Unit</span>
                <span className="font-medium text-foreground">{item.quantity} Unit</span>
              </div>
            </div>
          </div>

          {/* Card 2: Pengadaan & Dokumen */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-primary" />
              Pengadaan & Dokumen
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block mb-0.5">Merk & Tipe</span>
                <span className="font-semibold text-foreground">
                  {item.brand?.name || "-"} {item.type ? `(${item.type})` : ""}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-0.5">Serial Number</span>
                <span className="font-mono text-foreground">{item.serialNumber || "-"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-0.5">Tahun Pengadaan</span>
                <span className="font-medium text-foreground">{item.year || "-"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-0.5">Sumber Dana</span>
                <span className="font-medium text-foreground">{item.source || "-"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-0.5">Estimasi Harga</span>
                <span className="font-medium text-foreground">
                  {item.price ? `Rp ${item.price.toLocaleString("id-ID")}` : "-"}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-0.5">No. Dokumen</span>
                <span className="font-mono text-foreground">{item.documentNo || "-"}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Catatan */}
          {item.note && (
            <div className="md:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm mb-2">
                <FileText className="w-4 h-4 text-primary" />
                Catatan
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {item.note}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Specs */}
      {activeTab === "specs" && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            Spesifikasi Perangkat Keras & Lunak
          </h3>
          {item.specs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Belum ada data spesifikasi teknis untuk barang ini.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {item.specs.map((spec) => (
                <div
                  key={spec.id}
                  className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between"
                >
                  <span className="text-xs font-semibold text-muted-foreground uppercase">{spec.key}</span>
                  <span className="text-sm font-medium text-foreground">{spec.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: History */}
      {activeTab === "history" && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            Riwayat Perjalanan & Perubahan Barang
          </h3>
          {item.history.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Belum ada catatan riwayat aktivitas.
            </p>
          ) : (
            <div className="relative pl-6 border-l-2 border-primary/30 space-y-6 my-4">
              {item.history.map((h) => (
                <div key={h.id} className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-primary ring-4 ring-card" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground">
                        {h.action}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(h.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground font-medium">{h.description}</p>
                    {h.user && (
                      <p className="text-xs text-muted-foreground">
                        Dicatat oleh: <strong>{h.user.name}</strong> ({h.user.role})
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: QR Code */}
      {activeTab === "qr" && (
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm text-center max-w-md mx-auto space-y-5">
          <div className="p-6 border-2 border-dashed border-border rounded-2xl inline-block bg-white text-black shadow-sm">
            <div className="font-bold text-xs uppercase tracking-wider mb-2 text-slate-700">
              SMK LAB RPL — INVENTARIS
            </div>
            {/* Simple simulated QR code display with barcode pattern */}
            <div className="w-44 h-44 mx-auto bg-slate-900 flex flex-col items-center justify-center p-3 rounded-lg text-white text-center">
              <QrCode className="w-28 h-28 text-white mb-1" />
              <span className="font-mono text-xs font-bold">{item.code}</span>
            </div>
            <div className="mt-3 font-semibold text-xs text-slate-800">
              {item.name}
            </div>
            <div className="text-[10px] text-slate-500">
              {item.room?.name || "Lab RPL"} • {item.position || "-"}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-3">
              Tempel label ini pada unit barang. Scan dengan kamera HP untuk melihat informasi dan membuat laporan kerusakan instan.
            </p>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110"
            >
              <Printer className="w-4 h-4" />
              Cetak Stiker QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
