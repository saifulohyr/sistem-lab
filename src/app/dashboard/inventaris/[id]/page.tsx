"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
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
  Camera,
  UploadCloud,
  Plus,
  X,
  ZoomIn,
  Image as ImageIcon,
  Loader2,
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
  photos: {
    id: string;
    url: string;
    label: string | null;
    createdAt: string;
  }[];
  history: {
    id: string;
    action: string;
    description: string;
    createdAt: string;
    user: { name: string; role: string } | null;
  }[];
}

const PRESET_LABELS = [
  "Tampak Depan",
  "Tampak Belakang",
  "Tampak Samping",
  "Label & Barcode",
  "Nomor Seri",
  "Kondisi Fisik / Kerusakan",
  "Kelengkapan & Aksesoris",
];

export default function DetailInventarisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const [item, setItem] = useState<InventoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "photos" | "specs" | "history" | "qr">("info");

  // Photo management state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [photoLabel, setPhotoLabel] = useState("Tampak Depan");
  const [uploading, setUploading] = useState(false);
  const [activeZoomPhoto, setActiveZoomPhoto] = useState<{ url: string; label: string | null } | null>(null);

  const canManagePhotos = session?.user?.role === "ADMIN" || session?.user?.role === "TOOLMAN";

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
        toast.success("Inventaris berhasil dihapus");
        router.push("/dashboard/inventaris");
      } else {
        const d = await res.json();
        toast.error(d.error || "Gagal menghapus");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, WebP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 10MB");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Silakan pilih file foto terlebih dahulu");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Mengunggah foto ke storage...");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("label", photoLabel.trim() || "Foto Barang");

      const res = await fetch(`/api/inventaris/${id}/photos`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (res.ok && json.data) {
        toast.success("Foto berhasil diunggah!", { id: toastId });
        setItem((prev) =>
          prev
            ? {
                ...prev,
                photos: [json.data, ...(prev.photos || [])],
              }
            : prev
        );
        setSelectedFile(null);
        setFilePreview(null);
        setPhotoLabel("Tampak Depan");
        setUploadModalOpen(false);
      } else {
        toast.error(json.error || "Gagal mengunggah foto", { id: toastId });
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Gagal terhubung ke server", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("Hapus foto dokumentasi ini?")) return;

    const toastId = toast.loading("Menghapus foto...");
    try {
      const res = await fetch(`/api/inventaris/${id}/photos?photoId=${photoId}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (res.ok) {
        toast.success("Foto berhasil dihapus", { id: toastId });
        setItem((prev) =>
          prev
            ? {
                ...prev,
                photos: (prev.photos || []).filter((p) => p.id !== photoId),
              }
            : prev
        );
      } else {
        toast.error(json.error || "Gagal menghapus foto", { id: toastId });
      }
    } catch (err) {
      console.error("Delete photo error:", err);
      toast.error("Terjadi kesalahan saat menghapus foto", { id: toastId });
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

  const primaryPhoto = item.photos && item.photos.length > 0 ? item.photos[0] : null;

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
          { key: "photos", label: `Foto (${item.photos?.length || 0})`, icon: Camera },
          { key: "specs", label: `Spesifikasi (${item.specs?.length || 0})`, icon: Cpu },
          { key: "history", label: `Riwayat (${item.history?.length || 0})`, icon: History },
          { key: "qr", label: "QR Label", icon: QrCode },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 ${
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
        <div className="space-y-6">
          {/* Quick Photo Preview Card if exists */}
          {primaryPhoto && (
            <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div
                onClick={() => setActiveZoomPhoto(primaryPhoto)}
                className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-xl overflow-hidden bg-muted/40 border border-border/80 shrink-0 cursor-pointer group"
              >
                <img
                  src={primaryPhoto.url}
                  alt={primaryPhoto.label || item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                  <ZoomIn className="w-5 h-5" />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                  <Camera className="w-3.5 h-3.5" />
                  {primaryPhoto.label || "Foto Utama"}
                </div>
                <h2 className="text-base font-bold text-foreground">Dokumentasi Visual Tersedia</h2>
                <p className="text-xs text-muted-foreground">
                  Terdapat total {item.photos?.length || 0} foto dokumentasi untuk inventaris ini.
                </p>
                <button
                  onClick={() => setActiveTab("photos")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-1"
                >
                  Lihat Semua Galeri Foto ({item.photos?.length || 0}) →
                </button>
              </div>
            </div>
          )}

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
        </div>
      )}

      {/* Tab Content: Photos Gallery */}
      {activeTab === "photos" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                Dokumentasi & Galeri Foto Barang
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Foto fisik, nomor seri, kondisi kerusakan, dan kelengkapan inventaris {item.code}
              </p>
            </div>
            {canManagePhotos && (
              <button
                onClick={() => setUploadModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 shadow-sm transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                Unggah Foto Baru
              </button>
            )}
          </div>

          {/* Photos Grid */}
          {!item.photos || item.photos.length === 0 ? (
            <div className="bg-card border border-border border-dashed rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mx-auto text-muted-foreground">
                <ImageIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Belum Ada Foto Dokumentasi</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Unggah foto fisik barang, stiker serial number, atau bukti kondisi barang untuk mempermudah identifikasi dan audit lab.
                </p>
              </div>
              {canManagePhotos && (
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all"
                >
                  <UploadCloud className="w-4 h-4" />
                  Unggah Foto Sekarang
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {item.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div className="relative aspect-4/3 bg-muted/40 overflow-hidden cursor-pointer">
                    <img
                      src={photo.url}
                      alt={photo.label || item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onClick={() => setActiveZoomPhoto(photo)}
                    />
                    <div
                      onClick={() => setActiveZoomPhoto(photo)}
                      className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                    >
                      <ZoomIn className="w-6 h-6 drop-shadow-md" />
                    </div>
                    {photo.label && (
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-black/70 backdrop-blur-xs text-white">
                        {photo.label}
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 flex items-center justify-between gap-2 border-t border-border bg-card">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {photo.label || "Foto Barang"}
                      </p>
                      <span className="text-[10px] text-muted-foreground block">
                        {formatDate(photo.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setActiveZoomPhoto(photo)}
                        title="Perbesar"
                        className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      {canManagePhotos && (
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          title="Hapus foto"
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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

      {/* Modal: Upload Photo */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-foreground">Unggah Foto Inventaris</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Simpan dokumentasi visual ke Supabase Storage</p>
              </div>
              <button
                onClick={() => {
                  if (!uploading) {
                    setUploadModalOpen(false);
                    setSelectedFile(null);
                    setFilePreview(null);
                  }
                }}
                disabled={uploading}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadPhoto} className="p-4 sm:p-5 space-y-4">
              {/* File Dropzone / Picker */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Pilih Berkas Foto (JPG, PNG, WebP)
                </label>
                {filePreview ? (
                  <div className="relative aspect-16/9 rounded-xl overflow-hidden border border-border bg-muted/30">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreview(null);
                      }}
                      disabled={uploading}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/10 hover:bg-muted/30">
                    <UploadCloud className="w-8 h-8 text-primary mb-2" />
                    <span className="text-xs font-semibold text-foreground">Klik untuk memilih foto</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">Maksimal ukuran file 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Label Selector */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Label / Keterangan Foto
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_LABELS.map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setPhotoLabel(lbl)}
                      disabled={uploading}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        photoLabel === lbl
                          ? "bg-primary text-primary-foreground border-primary font-semibold"
                          : "border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={photoLabel}
                  onChange={(e) => setPhotoLabel(e.target.value)}
                  placeholder="Ketik keterangan atau pilih label di atas"
                  disabled={uploading}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setUploadModalOpen(false);
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                  disabled={uploading}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || uploading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Mengunggah...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      Mulai Unggah
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Zooming Photos */}
      {activeZoomPhoto && (
        <div
          onClick={() => setActiveZoomPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center"
          >
            <button
              onClick={() => setActiveZoomPhoto(null)}
              className="absolute -top-10 right-0 p-1.5 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={activeZoomPhoto.url}
              alt={activeZoomPhoto.label || "Foto Inventaris"}
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
            />

            {activeZoomPhoto.label && (
              <div className="mt-3 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-medium border border-white/20">
                {activeZoomPhoto.label}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
