"use client";

import { useEffect, useState } from "react";
import { Plus, Eye, Calendar, Clock, CheckCircle2, User as UserIcon } from "lucide-react";
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
import { formatDateShort, getRoleLabel } from "@/lib/utils";

interface Borrowing {
  id: string;
  number: string;
  date: string;
  borrower: string;
  role: string | null;
  purpose: string;
  status: string;
  expectedReturn: string | null;
  actualReturn: string | null;
  _count: { items: number };
}

export default function PeminjamanPage() {
  const { data: session } = useSession();
  const isAdminOrToolman = session?.role === "ADMIN" || session?.role === "TOOLMAN";

  const [records, setRecords] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/peminjaman");
      const json = await res.json();
      if (json.data) setRecords(json.data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data peminjaman");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Peminjaman Barang</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Kelola sirkulasi peminjaman dan pengembalian barang lab</p>
        </div>
        
        <Link href="/dashboard/peminjaman/baru">
          <Button className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm h-9">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {isAdminOrToolman ? "Pinjamkan Barang" : "Ajukan Peminjaman"}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Riwayat Peminjaman</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Menampilkan {records.length} transaksi
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 pt-0">
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Peminjam</TableHead>
                  <TableHead>Tgl Pinjam</TableHead>
                  <TableHead>Tenggat Waktu</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Jml Barang</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Belum ada transaksi peminjaman.
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => {
                    const isLate = record.status === "DIPINJAM" && record.expectedReturn && new Date(record.expectedReturn) < new Date();
                    
                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground flex items-center gap-1">
                              <UserIcon className="h-3 w-3 text-muted-foreground" />
                              {record.borrower}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {getRoleLabel(record.role || "")} • {record.number}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Calendar className="h-3 w-3" />
                            {formatDateShort(record.date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.status === "DIKEMBALIKAN" ? (
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">Dikembalikan pd:</span>
                              <span className="text-sm font-medium">{formatDateShort(record.actualReturn || "")}</span>
                            </div>
                          ) : (
                            <div className={`flex items-center gap-2 text-sm font-medium ${isLate ? "text-red-500" : "text-muted-foreground"}`}>
                              <Clock className="h-3 w-3" />
                              {record.expectedReturn ? formatDateShort(record.expectedReturn) : "-"}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {record.status === "DIPINJAM" ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isLate ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"}`}>
                              {isLate ? "TERLAMBAT" : "DIPINJAM"}
                            </span>
                          ) : (
                            <span className="bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-full text-xs font-semibold flex items-center justify-center gap-1 w-fit mx-auto">
                              <CheckCircle2 className="h-3 w-3" /> SELESAI
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="bg-muted px-2 py-1 rounded-full text-xs font-semibold">
                            {record._count.items} item
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/peminjaman/${record.id}`}>
                            <Button variant={record.status === "DIPINJAM" ? "default" : "outline"} size="sm" className={record.status === "DIPINJAM" ? "bg-blue-600 hover:bg-blue-700" : ""}>
                              {record.status === "DIPINJAM" ? "Kembalikan" : "Detail"}
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
