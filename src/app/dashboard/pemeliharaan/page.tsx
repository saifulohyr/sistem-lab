"use client";

import { useEffect, useState } from "react";
import { Plus, Search, ShieldCheck, Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateShort } from "@/lib/utils";

export default function PemeliharaanPage() {
  const { data: session } = useSession();
  const isAdminOrToolman = session?.role === "ADMIN" || session?.role === "TOOLMAN";

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/pemeliharaan");
      const json = await res.json();
      if (json.data) setRecords(json.data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data pemeliharaan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus catatan pemeliharaan ini?")) return;
    try {
      const res = await fetch(`/api/pemeliharaan/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Data berhasil dihapus");
        fetchRecords();
      } else {
        toast.error(json.error || "Gagal menghapus");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    }
  };

  const filteredRecords = records.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Catatan Pemeliharaan</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Log kegiatan pemeliharaan lab rutin (Preventive) maupun dadakan (Corrective)</p>
        </div>
        {isAdminOrToolman && (
          <Link href="/dashboard/pemeliharaan/baru">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm h-9">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Tambah Catatan
            </Button>
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari kegiatan..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading data...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Belum ada catatan pemeliharaan.</div>
        ) : (
          <div className="divide-y">
            {filteredRecords.map((record) => (
              <div key={record.id} className="p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full shrink-0 ${record.type === 'PREVENTIVE' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                    {record.type === 'PREVENTIVE' ? <ShieldCheck className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 bg-muted rounded">{record.number}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase
                        ${record.type === 'PREVENTIVE' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        {record.type}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg leading-tight mb-1">{record.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{record.description}</p>
                    {record.result && (
                      <p className="text-sm mt-2"><span className="font-semibold text-emerald-600">Hasil:</span> {record.result}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 text-sm whitespace-nowrap">
                  <div className="text-right">
                    <p className="font-bold">{formatDateShort(record.date)}</p>
                    <p className="text-xs text-muted-foreground">Oleh: {record.technician.name}</p>
                  </div>
                  {session?.role === "ADMIN" && (
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(record.id)}>
                      Hapus
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
