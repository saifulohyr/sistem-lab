"use client";

import { useEffect, useState } from "react";
import { Plus, Wrench, AlertTriangle, FileWarning, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDateShort } from "@/lib/utils";

interface DamageReport {
  id: string;
  number: string;
  date: string;
  reporter: string;
  issue: string;
  status: string;
  inventory: { name: string; code: string; category: { name: string } };
}

interface RepairTicket {
  id: string;
  number: string;
  date: string;
  status: string;
  damageType: string | null;
  severity: string | null;
  technician: { name: string };
  inventory: { name: string; code: string };
  damageReport?: { number: string; reporter: string };
}

export default function PerbaikanPage() {
  const { data: session } = useSession();
  const isAdminOrToolman = session?.role === "ADMIN" || session?.role === "TOOLMAN";

  const [reports, setReports] = useState<DamageReport[]>([]);
  const [repairs, setRepairs] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const [resReports, resRepairs] = await Promise.all([
        fetch("/api/perbaikan/laporan"),
        fetch("/api/perbaikan/tiket")
      ]);
      const [jsonReports, jsonRepairs] = await Promise.all([
        resReports.json(),
        resRepairs.json()
      ]);
      
      if (jsonReports.data) setReports(jsonReports.data);
      if (jsonRepairs.data) setRepairs(jsonRepairs.data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  // Filter reports
  const pendingReports = reports.filter(r => r.status === "MENUNGGU");
  
  // Organize repairs for kanban
  const diagnosisRepairs = repairs.filter(r => r.status === "DIAGNOSA");
  const processRepairs = repairs.filter(r => r.status === "PROSES");
  const testRepairs = repairs.filter(r => r.status === "TESTING");
  const doneRepairs = repairs.filter(r => r.status === "SELESAI");

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Manajemen Perbaikan</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Kelola laporan kerusakan dan tiket perbaikan teknisi</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/perbaikan/laporan">
            <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50 text-xs sm:text-sm h-9">
              <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
              Lapor Kerusakan
            </Button>
          </Link>
          {isAdminOrToolman && (
            <Link href="/dashboard/perbaikan/tiket-baru">
              <Button className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm h-9">
                <Wrench className="mr-1.5 h-3.5 w-3.5" />
                Buat Tiket Perbaikan
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6 items-start">
        {/* Kolom Laporan Masuk (Menunggu) */}
        <div className="xl:col-span-1 flex flex-col gap-3 sm:gap-4">
          <div className="bg-amber-100 text-amber-800 font-bold px-3 sm:px-4 py-2 rounded-lg flex items-center justify-between text-xs sm:text-sm">
            <span>Laporan Baru</span>
            <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingReports.length}</span>
          </div>
          
          <div className="flex flex-col gap-3 min-h-[140px] md:min-h-[480px] bg-muted/30 p-2 sm:p-3 rounded-xl border border-dashed border-amber-200">
            {pendingReports.length === 0 ? (
              <div className="text-center p-4 text-sm text-muted-foreground mt-4">Tidak ada laporan baru</div>
            ) : (
              pendingReports.map(report => (
                <Card key={report.id} className="border-amber-200 shadow-sm shadow-amber-500/5">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded uppercase">
                        {report.number}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{formatDateShort(report.date)}</span>
                    </div>
                    <p className="text-sm font-bold leading-tight mb-1">{report.inventory.name}</p>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{report.issue}</p>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t text-[10px]">
                      <span className="text-muted-foreground">{report.reporter}</span>
                      <Link href={`/dashboard/perbaikan/laporan/${report.id}`}>
                        <Button variant="ghost" size="sm" className="h-6 text-blue-600 px-2">Cek & Tindak</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Kolom Tiket Perbaikan (Kanban) */}
        <div className="xl:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* DIAGNOSA */}
          <div className="flex flex-col gap-4">
            <div className="bg-blue-100 text-blue-800 font-bold px-4 py-2 rounded-lg flex items-center justify-between">
              <span>Diagnosa</span>
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{diagnosisRepairs.length}</span>
            </div>
            <div className="flex flex-col gap-3 min-h-[140px] md:min-h-[480px] bg-muted/30 p-2 sm:p-3 rounded-xl border border-dashed border-blue-200">
              {diagnosisRepairs.map(repair => (
                <RepairCard key={repair.id} repair={repair} color="blue" />
              ))}
            </div>
          </div>

          {/* PROSES */}
          <div className="flex flex-col gap-4">
            <div className="bg-purple-100 text-purple-800 font-bold px-4 py-2 rounded-lg flex items-center justify-between">
              <span>Sedang Proses</span>
              <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">{processRepairs.length}</span>
            </div>
            <div className="flex flex-col gap-3 min-h-[140px] md:min-h-[480px] bg-muted/30 p-2 sm:p-3 rounded-xl border border-dashed border-purple-200">
              {processRepairs.map(repair => (
                <RepairCard key={repair.id} repair={repair} color="purple" />
              ))}
            </div>
          </div>

          {/* TESTING */}
          <div className="flex flex-col gap-4">
            <div className="bg-indigo-100 text-indigo-800 font-bold px-4 py-2 rounded-lg flex items-center justify-between">
              <span>Testing</span>
              <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">{testRepairs.length}</span>
            </div>
            <div className="flex flex-col gap-3 min-h-[140px] md:min-h-[480px] bg-muted/30 p-2 sm:p-3 rounded-xl border border-dashed border-indigo-200">
              {testRepairs.map(repair => (
                <RepairCard key={repair.id} repair={repair} color="indigo" />
              ))}
            </div>
          </div>

          {/* SELESAI */}
          <div className="flex flex-col gap-4">
            <div className="bg-emerald-100 text-emerald-800 font-bold px-4 py-2 rounded-lg flex items-center justify-between">
              <span>Selesai</span>
              <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">{doneRepairs.length}</span>
            </div>
            <div className="flex flex-col gap-3 min-h-[140px] md:min-h-[480px] bg-muted/30 p-2 sm:p-3 rounded-xl border border-dashed border-emerald-200">
              {doneRepairs.slice(0, 5).map(repair => (
                <RepairCard key={repair.id} repair={repair} color="emerald" />
              ))}
              {doneRepairs.length > 5 && (
                <div className="text-center p-2 text-xs text-muted-foreground">
                  +{doneRepairs.length - 5} tiket lainnya
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function RepairCard({ repair, color }: { repair: RepairTicket, color: string }) {
  const getSeverityLabel = (s: string | null) => {
    if (!s) return null;
    if (s === "BERAT") return <span className="text-red-500 font-bold text-[10px]">🔥 BERAT</span>;
    if (s === "SEDANG") return <span className="text-amber-500 font-bold text-[10px]">⚡ SEDANG</span>;
    return <span className="text-emerald-500 font-bold text-[10px]">✨ RINGAN</span>;
  };

  const borderColors = {
    blue: "border-blue-200 hover:border-blue-400",
    purple: "border-purple-200 hover:border-purple-400",
    indigo: "border-indigo-200 hover:border-indigo-400",
    emerald: "border-emerald-200 hover:border-emerald-400",
  };

  return (
    <Link href={`/dashboard/perbaikan/${repair.id}`}>
      <Card className={`transition-all shadow-sm hover:shadow-md cursor-pointer ${borderColors[color as keyof typeof borderColors]}`}>
        <CardContent className="p-3">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-muted text-muted-foreground rounded uppercase">
              {repair.number}
            </span>
            {getSeverityLabel(repair.severity)}
          </div>
          <p className="text-sm font-bold leading-tight mb-1">{repair.inventory.name}</p>
          <p className="text-[10px] text-muted-foreground bg-muted w-fit px-1 rounded mb-2">
            {repair.inventory.code}
          </p>
          
          <div className="flex justify-between items-center mt-3 pt-2 border-t text-[10px]">
            <span className="text-muted-foreground truncate w-24">👷 {repair.technician.name}</span>
            <span className="text-muted-foreground">{formatDateShort(repair.date)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
