"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Printer, CheckCircle, ShieldCheck, Building2, User, Calendar, ClipboardList, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatDateShort, getConditionLabel, getConditionColor } from "@/lib/utils";

interface Item {
  id: string;
  code: string;
  name: string;
  category: string | null;
  brand: string | null;
  type: string | null;
  serialNumber: string | null;
  specification: string | null;
  quantity: number;
  condition: string;
  completeness: string | null;
  functionStatus: string | null;
  location: string | null;
  checkStatus: string;
  note: string | null;
}

interface InitialInventoryDetail {
  id: string;
  number: string;
  date: string;
  status: string;
  approvedBy: string | null;
  approvedAt: string | null;
  note: string | null;
  createdAt: string;
  user: {
    name: string;
    role: string;
  };
  room: {
    id: string;
    name: string;
    capacity: number | null;
  };
  items: Item[];
}

export default function DetailPendataanAwalPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [data, setData] = useState<InitialInventoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/pendataan-awal/${resolvedParams.id}`);
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      } else {
        toast.error(json.error || "Data tidak ditemukan");
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data detail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id]);

  const handleApprove = async () => {
    if (!confirm("Apakah Anda yakin ingin mengesahkan dokumen pendataan awal ini?")) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/pendataan-awal/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DISAHKAN",
          approvedBy: session?.user?.name || "Admin",
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Dokumen pendataan awal berhasil disahkan");
        fetchData();
      } else {
        toast.error(json.error || "Gagal mengesahkan dokumen");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setApproving(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
        <p className="text-muted-foreground">Dokumen tidak ditemukan</p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </div>
    );
  }

  const isDisahkan = data.status === "DISAHKAN";
  const canApprove = session?.user && ["ADMIN", "TOOLMAN"].includes((session.user as any).role) && !isDisahkan;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-6xl mx-auto w-full print:p-0 print:max-w-none">
      {/* Top action header (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => router.push("/dashboard/pendataan-awal")}>
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{data.number}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                  isDisahkan
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                }`}
              >
                {data.status}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Dokumen Inventarisasi Awal Laboratorium
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canApprove && (
            <Button
              onClick={handleApprove}
              disabled={approving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm text-xs sm:text-sm h-9"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
              {approving ? "Memproses..." : "Sahkan Dokumen"}
            </Button>
          )}
          <Button onClick={handlePrint} variant="outline" className="text-xs sm:text-sm h-9">
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Cetak Berita Acara
          </Button>
        </div>
      </div>

      {/* Main Document Content (Visible on Screen & Print) */}
      <div className="bg-card print:bg-white text-card-foreground print:text-black rounded-xl border print:border-none shadow-sm p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-auto">
        {/* Kop Surat (Printed / Document Header) */}
        <div className="border-b-2 border-black/80 pb-4 text-center">
          <h2 className="text-xl font-bold uppercase tracking-wider">SMK NEGERI — PROGRAM KEAHLIAN TEKNIK KOMPUTER & INFORMATIKA</h2>
          <h3 className="text-lg font-extrabold uppercase text-blue-600 print:text-black mt-0.5">LABORATORIUM REKAYASA PERANGKAT LUNAK (LABMUMA)</h3>
          <p className="text-xs text-muted-foreground print:text-gray-600 mt-1">
            Jl. Pendidikan No. 1 • Telp: (021) 12345678 • Email: lab.rpl@sekolah.sch.id
          </p>
        </div>

        <div className="text-center my-4">
          <h1 className="text-xl font-bold uppercase underline tracking-wide">
            BERITA ACARA PENDATAAN AWAL INVENTARIS
          </h1>
          <p className="text-xs text-muted-foreground print:text-gray-700 mt-1">Nomor: {data.number}</p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/40 print:bg-gray-50 border text-sm">
          <div>
            <span className="text-xs text-muted-foreground block">Ruangan Laboratorium:</span>
            <span className="font-semibold">{data.room?.name || "-"}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Tanggal Pendataan:</span>
            <span className="font-semibold">{formatDate(data.date)}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Petugas Pendata:</span>
            <span className="font-semibold">{data.user?.name || "-"}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Status Dokumen:</span>
            <span className="font-semibold text-emerald-600 print:text-black">
              {data.status} {data.approvedBy ? `(Disahkan oleh: ${data.approvedBy})` : ""}
            </span>
          </div>
        </div>

        {data.note && (
          <div className="p-3 bg-blue-50/50 print:bg-transparent border border-blue-100 print:border-gray-300 rounded text-xs">
            <span className="font-bold">Catatan Pendataan:</span> {data.note}
          </div>
        )}

        {/* Items Table */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-base">Rincian Barang Terdata ({data.items?.length || 0} Item)</h4>
          </div>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 print:bg-gray-100">
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Merk / Tipe</TableHead>
                  <TableHead>Spesifikasi</TableHead>
                  <TableHead className="text-center">Jumlah</TableHead>
                  <TableHead className="text-center">Kondisi</TableHead>
                  <TableHead>Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      Tidak ada data item dalam pendataan ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.items.map((item, idx) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-center font-medium text-xs">{idx + 1}</TableCell>
                      <TableCell className="font-mono text-xs font-semibold">{item.code}</TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{item.name}</div>
                        {item.category && <span className="text-[10px] text-muted-foreground">Kat: {item.category}</span>}
                      </TableCell>
                      <TableCell className="text-xs">
                        {item.brand || "-"} {item.type ? `(${item.type})` : ""}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                        {item.specification || "-"}
                      </TableCell>
                      <TableCell className="text-center text-sm font-semibold">{item.quantity} Unit</TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.condition === "BAIK"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.condition === "RUSAK_RINGAN"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {getConditionLabel(item.condition)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.note || item.checkStatus || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Official Signatures Section (Tanda Tangan Pengesahan) */}
        <div className="pt-8 grid grid-cols-2 gap-8 text-center text-sm">
          <div className="flex flex-col items-center">
            <p className="text-xs text-muted-foreground print:text-gray-700">Petugas Pendataan / Toolman,</p>
            <div className="h-20" />
            <p className="font-bold underline uppercase">{data.user?.name || "....................................."}</p>
            <p className="text-xs text-muted-foreground">NIP/NIK. .....................................</p>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-xs text-muted-foreground print:text-gray-700">Mengetahui / Mengesahkan,</p>
            <p className="text-xs font-semibold">Toolman Laboratorium RPL</p>
            <div className="h-16" />
            <p className="font-bold underline uppercase">{data.approvedBy || "....................................."}</p>
            <p className="text-xs text-muted-foreground">NIP. .....................................</p>
          </div>
        </div>
      </div>
    </div>
  );
}
