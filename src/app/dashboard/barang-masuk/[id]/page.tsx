"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Printer, Trash2, PackagePlus, Truck, Calendar, FileText, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatCurrency } from "@/lib/utils";

interface IncomingItem {
  id: string;
  quantity: number;
  price: number | null;
  note: string | null;
  inventory: {
    code: string;
    name: string;
    category?: { name: string };
  };
}

interface IncomingGoodsDetail {
  id: string;
  number: string;
  date: string;
  source: string | null;
  documentNo: string | null;
  note: string | null;
  createdAt: string;
  supplier: {
    id: string;
    name: string;
    contactName: string | null;
    phone: string | null;
    address: string | null;
  } | null;
  user: {
    name: string;
  };
  items: IncomingItem[];
}

export default function DetailBarangMasukPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [data, setData] = useState<IncomingGoodsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/barang-masuk/${resolvedParams.id}`);
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      } else {
        toast.error(json.error || "Data tidak ditemukan");
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data transaksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id]);

  const handleDelete = async () => {
    if (!confirm("Hapus transaksi barang masuk ini? Stok barang terkait akan dikurangi kembali.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/barang-masuk/${resolvedParams.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Transaksi berhasil dihapus dan stok disesuaikan");
        router.push("/dashboard/barang-masuk");
      } else {
        toast.error(json.error || "Gagal menghapus transaksi");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setDeleting(false);
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
        <p className="text-muted-foreground">Transaksi tidak ditemukan</p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </div>
    );
  }

  const totalQuantity = data.items.reduce((acc, it) => acc + it.quantity, 0);
  const totalPrice = data.items.reduce((acc, it) => acc + (it.price ? it.price * it.quantity : 0), 0);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-5xl mx-auto w-full print:p-0 print:max-w-none">
      {/* Top action header (Hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => router.push("/dashboard/barang-masuk")}>
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{data.number}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Penerimaan Masuk
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Rincian Pengadaan & Penerimaan Barang Laboratorium
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {session?.user && (session.user as any).role === "ADMIN" && (
            <Button
              variant="destructive"
              size="sm"
              className="text-xs sm:text-sm h-9"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              {deleting ? "Menghapus..." : "Hapus Transaksi"}
            </Button>
          )}
          <Button onClick={handlePrint} variant="outline" className="text-xs sm:text-sm h-9">
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Cetak Bukti Penerimaan
          </Button>
        </div>
      </div>

      {/* Main Document Content */}
      <div className="bg-card print:bg-white text-card-foreground print:text-black rounded-xl border print:border-none shadow-sm p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-auto">
        {/* Kop Surat */}
        <div className="border-b-2 border-black/80 pb-4 text-center">
          <h2 className="text-xl font-bold uppercase tracking-wider">SMK NEGERI — PROGRAM KEAHLIAN TEKNIK KOMPUTER & INFORMATIKA</h2>
          <h3 className="text-lg font-extrabold uppercase text-blue-600 print:text-black mt-0.5">LABORATORIUM REKAYASA PERANGKAT LUNAK (LABMUMA)</h3>
          <p className="text-xs text-muted-foreground print:text-gray-600 mt-1">
            Jl. Pendidikan No. 1 • Telp: (021) 12345678 • Email: lab.rpl@sekolah.sch.id
          </p>
        </div>

        <div className="text-center my-4">
          <h1 className="text-xl font-bold uppercase underline tracking-wide">
            BUKTI PENERIMAAN BARANG MASUK
          </h1>
          <p className="text-xs text-muted-foreground print:text-gray-700 mt-1">Nomor Transaksi: {data.number}</p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/40 print:bg-gray-50 border text-sm">
          <div>
            <span className="text-xs text-muted-foreground block">Tanggal Penerimaan:</span>
            <span className="font-semibold">{formatDate(data.date)}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Supplier / Vendor:</span>
            <span className="font-semibold">{data.supplier?.name || "Pengadaan Internal / Hibah"}</span>
            {data.supplier?.phone && <span className="text-xs text-muted-foreground block">{data.supplier.phone}</span>}
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Sumber Dana / Dokumen:</span>
            <span className="font-semibold">{data.source || "BOS / Komite"}</span>
            {data.documentNo && <span className="text-xs text-muted-foreground block">No Dok: {data.documentNo}</span>}
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Petugas Penerima:</span>
            <span className="font-semibold">{data.user?.name || "-"}</span>
          </div>
        </div>

        {data.note && (
          <div className="p-3 bg-muted/30 border rounded text-xs">
            <span className="font-bold">Catatan / Keterangan:</span> {data.note}
          </div>
        )}

        {/* Table of items */}
        <div>
          <h4 className="font-bold text-base mb-3">Rincian Barang yang Diterima</h4>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 print:bg-gray-100">
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead>Kode Barang</TableHead>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead className="text-center">Jumlah (Qty)</TableHead>
                  <TableHead className="text-right">Harga Satuan</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead>Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item, idx) => {
                  const subtotal = item.price ? item.price * item.quantity : null;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="text-center font-medium text-xs">{idx + 1}</TableCell>
                      <TableCell className="font-mono text-xs font-semibold">{item.inventory?.code || "-"}</TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{item.inventory?.name || "Barang"}</div>
                        {item.inventory?.category && (
                          <span className="text-[10px] text-muted-foreground">{item.inventory.category.name}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-bold text-sm">{item.quantity} Unit</TableCell>
                      <TableCell className="text-right text-xs">{formatCurrency(item.price)}</TableCell>
                      <TableCell className="text-right font-semibold text-xs">{formatCurrency(subtotal)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.note || "-"}</TableCell>
                    </TableRow>
                  );
                })}
                {/* Total Summary Row */}
                <TableRow className="bg-muted/30 print:bg-gray-50 font-bold">
                  <TableCell colSpan={3} className="text-right text-sm">TOTAL KESELURUHAN:</TableCell>
                  <TableCell className="text-center text-sm font-extrabold">{totalQuantity} Unit</TableCell>
                  <TableCell className="text-right text-xs">-</TableCell>
                  <TableCell className="text-right text-sm text-emerald-600 print:text-black">{formatCurrency(totalPrice)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-8 grid grid-cols-2 gap-8 text-center text-sm">
          <div className="flex flex-col items-center">
            <p className="text-xs text-muted-foreground print:text-gray-700">Yang Menyerahkan (Vendor / Pengirim),</p>
            <div className="h-20" />
            <p className="font-bold underline uppercase">{data.supplier?.contactName || data.supplier?.name || "....................................."}</p>
            <p className="text-xs text-muted-foreground">Tanda Tangan & Cap</p>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-xs text-muted-foreground print:text-gray-700">Penerima Barang (Petugas Lab),</p>
            <div className="h-20" />
            <p className="font-bold underline uppercase">{data.user?.name || "....................................."}</p>
            <p className="text-xs text-muted-foreground">Toolman / Pengelola Lab</p>
          </div>
        </div>
      </div>
    </div>
  );
}
