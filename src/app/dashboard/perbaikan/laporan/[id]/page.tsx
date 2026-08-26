"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Wrench, XCircle, CheckCircle2, User, Calendar, MapPin, Package, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface DamageReportDetail {
  id: string;
  number: string;
  date: string;
  reporter: string;
  issue: string;
  photoUrl: string | null;
  status: string;
  createdAt: string;
  user: {
    name: string;
  };
  inventory: {
    id: string;
    code: string;
    name: string;
    condition: string;
    category?: { name: string };
    room?: { name: string };
  };
  repairs: {
    id: string;
    number: string;
    status: string;
    date: string;
  }[];
}

export default function DetailLaporanKerusakanPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [data, setData] = useState<DamageReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/perbaikan/laporan/${resolvedParams.id}`);
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      } else {
        toast.error(json.error || "Data laporan tidak ditemukan");
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data laporan kerusakan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id]);

  const handleReject = async () => {
    if (!confirm("Tolak laporan kerusakan ini? Status barang akan dikembalikan menjadi 'AKTIF'.")) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/perbaikan/laporan/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DITOLAK" }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Laporan berhasil ditolak");
        fetchData();
      } else {
        toast.error(json.error || "Gagal menolak laporan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Hapus catatan laporan kerusakan ini?")) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/perbaikan/laporan/${resolvedParams.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Laporan berhasil dihapus");
        router.push("/dashboard/perbaikan");
      } else {
        toast.error(json.error || "Gagal menghapus");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Laporan tidak ditemukan</p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </div>
    );
  }

  const isPending = data.status === "MENUNGGU";
  const isProcess = data.status === "DIPROSES";
  const isRejected = data.status === "DITOLAK";
  const isDone = data.status === "SELESAI";

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-4xl mx-auto w-full">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => router.push("/dashboard/perbaikan")}>
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-amber-600">{data.number}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                  isPending
                    ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    : isProcess
                    ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                    : isRejected
                    ? "bg-red-500/10 text-red-600 border border-red-500/20"
                    : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                }`}
              >
                {data.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Tinjauan Laporan Kerusakan Barang</p>
          </div>
        </div>

        {session?.user && (session.user as any).role === "ADMIN" && (
          <Button variant="outline" size="sm" onClick={handleDelete} disabled={processing} className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4 mr-2" /> Hapus
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-amber-500/20 shadow-sm">
            <CardHeader className="bg-amber-500/5 pb-4 border-b border-amber-500/10">
              <CardTitle className="text-base flex items-center gap-2 text-amber-700">
                <AlertTriangle className="w-5 h-5" />
                Keluhan & Masalah yang Dilaporkan
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="p-4 rounded-xl bg-muted/40 border text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {data.issue}
              </div>

              {data.photoUrl && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-muted-foreground">Lampiran Foto:</span>
                  <div className="rounded-lg overflow-hidden border max-h-72">
                    <img src={data.photoUrl} alt="Foto Kerusakan" className="w-full object-cover" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Linked Repair Tickets if already processed */}
          {data.repairs && data.repairs.length > 0 && (
            <Card className="border-blue-500/20 shadow-sm">
              <CardHeader className="bg-blue-500/5 pb-4 border-b border-blue-500/10">
                <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                  <Wrench className="w-5 h-5" />
                  Tiket Perbaikan Terkait ({data.repairs.length})
                </CardTitle>
                <CardDescription>Tiket pengerjaan servis oleh teknisi untuk laporan ini</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 divide-y">
                {data.repairs.map(rep => (
                  <div key={rep.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-foreground">{rep.number}</p>
                      <p className="text-xs text-muted-foreground">Tanggal: {formatDate(rep.date)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 uppercase">
                        {rep.status}
                      </span>
                      <Link href={`/dashboard/perbaikan/${rep.id}`}>
                        <Button size="sm" variant="outline" className="h-8">
                          Buka Tiket <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Info & Action Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Informasi Pelapor & Barang
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">Nama Pelapor:</span>
                <span className="font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                  <User className="w-4 h-4 text-muted-foreground" /> {data.reporter}
                </span>
              </div>

              <div>
                <span className="text-xs text-muted-foreground block">Tanggal Lapor:</span>
                <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-4 h-4 text-muted-foreground" /> {formatDate(data.date)}
                </span>
              </div>

              <div className="pt-3 border-t">
                <span className="text-xs text-muted-foreground block">Barang Bermasalah:</span>
                <Link href={`/dashboard/inventaris/${data.inventory?.id}`} className="hover:underline font-bold text-blue-600 block mt-0.5">
                  {data.inventory?.name}
                </Link>
                <span className="text-xs font-mono text-muted-foreground block">Kode: {data.inventory?.code}</span>
              </div>

              <div>
                <span className="text-xs text-muted-foreground block">Lokasi Ruangan:</span>
                <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-4 h-4 text-muted-foreground" /> {data.inventory?.room?.name || "-"}
                </span>
              </div>

              <div>
                <span className="text-xs text-muted-foreground block">Kategori:</span>
                <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                  <Package className="w-4 h-4 text-muted-foreground" /> {data.inventory?.category?.name || "-"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Action Box */}
          {isPending && (
            <Card className="border-blue-500/30 bg-blue-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-blue-800">Tindak Lanjut Teknisi</CardTitle>
                <CardDescription className="text-xs">
                  Pilih tindakan yang ingin dilakukan terhadap laporan kerusakan ini.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/dashboard/perbaikan/tiket-baru?reportId=${data.id}`} className="w-full block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    <Wrench className="w-4 h-4 mr-2" />
                    Buat Tiket Perbaikan
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  onClick={handleReject}
                  disabled={processing}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Tolak Laporan
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
