"use client";

import { useEffect, useState } from "react";
import { Plus, Eye, Trash2, Calendar, FileText } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

interface IncomingGoods {
  id: string;
  number: string;
  date: string;
  supplier?: { name: string };
  user?: { name: string };
  source: string | null;
  _count: { items: number };
}

export default function BarangMasukPage() {
  const { data: session } = useSession();
  const isAdminOrToolman = session?.role === "ADMIN" || session?.role === "TOOLMAN";

  const [records, setRecords] = useState<IncomingGoods[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/barang-masuk");
      const json = await res.json();
      if (json.data) setRecords(json.data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data barang masuk");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("PERINGATAN: Menghapus transaksi ini akan MENGURANGI stok barang yang terkait. Yakin ingin menghapus?")) return;

    try {
      const res = await fetch(`/api/barang-masuk/${id}`, { method: "DELETE" });
      const json = await res.json();
      
      if (json.error) {
        toast.error(json.error);
        return;
      }

      toast.success("Transaksi berhasil dihapus");
      fetchRecords();
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Barang Masuk</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Log transaksi penerimaan dan pengadaan barang baru</p>
        </div>
        
        {isAdminOrToolman && (
          <Link href="/dashboard/barang-masuk/baru">
            <Button className="text-xs sm:text-sm h-9">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Catat Barang Masuk
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Riwayat Barang Masuk</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Menampilkan {records.length} transaksi
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 pt-0">
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead>No. Dokumen</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Supplier / Sumber</TableHead>
                  <TableHead>Penerima</TableHead>
                  <TableHead className="text-center">Jml Item</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Belum ada transaksi barang masuk.
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          {record.number}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(record.date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.supplier?.name || record.source || "-"}
                      </TableCell>
                      <TableCell>{record.user?.name}</TableCell>
                      <TableCell className="text-center">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-semibold">
                          {record._count.items}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/barang-masuk/${record.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {session?.role === "ADMIN" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDelete(record.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
