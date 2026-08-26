"use client";

import { useEffect, useState } from "react";
import { Plus, Search, CheckSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateShort } from "@/lib/utils";

export default function PemeriksaanPage() {
  const { data: session } = useSession();
  const isAdminOrToolman = session?.role === "ADMIN" || session?.role === "TOOLMAN";

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/pemeriksaan");
      const json = await res.json();
      if (json.data) setRecords(json.data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data pemeriksaan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus sesi pemeriksaan ini?")) return;
    try {
      const res = await fetch(`/api/pemeriksaan/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Sesi berhasil dihapus");
        fetchRecords();
      } else {
        toast.error(json.error || "Gagal menghapus");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Pemeriksaan Lab</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Sesi inspeksi dan pengecekan rutin ketersediaan barang per ruangan</p>
        </div>
        {isAdminOrToolman && (
          <Link href="/dashboard/pemeriksaan/baru">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-xs sm:text-sm h-9">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Mulai Pemeriksaan Baru
            </Button>
          </Link>
        )}
      </div>

      <div className="rounded-md border bg-card">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading data...</div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Belum ada catatan pemeriksaan.</div>
        ) : (
          <div className="divide-y">
            {records.map((record) => (
              <div key={record.id} className="p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full shrink-0 bg-indigo-100 text-indigo-600">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 bg-muted rounded">{record.number}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-indigo-100 text-indigo-700">
                        INSPEKSI
                      </span>
                    </div>
                    <h3 className="font-bold text-lg leading-tight mb-1">
                      Ruang: {record.room.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {record._count.items} barang diperiksa
                    </p>
                    {record.note && (
                      <p className="text-xs mt-1 text-muted-foreground line-clamp-1 border-l-2 pl-2 italic">
                        {record.note}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 text-sm whitespace-nowrap">
                  <div className="text-right">
                    <p className="font-bold">{formatDateShort(record.date)}</p>
                    <p className="text-xs text-muted-foreground">Petugas: {record.inspector.name}</p>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Link href={`/dashboard/pemeriksaan/${record.id}`}>
                      <Button variant="outline" size="sm" className="h-7 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                        Buka Detail
                      </Button>
                    </Link>
                    {session?.role === "ADMIN" && (
                      <Button variant="ghost" size="sm" className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(record.id)}>
                        Hapus
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
