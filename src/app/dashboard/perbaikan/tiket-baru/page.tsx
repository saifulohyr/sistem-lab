"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateCode } from "@/lib/utils";

import { useSearchParams } from "next/navigation";

export default function BaruTiketPerbaikanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialReportId = searchParams.get("reportId") || "";

  const [submitting, setSubmitting] = useState(false);
  
  const [inventories, setInventories] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    number: generateCode("TKT", Math.floor(Math.random() * 10000)),
    date: new Date().toISOString().split("T")[0],
    damageReportId: initialReportId,
    inventoryId: "",
    damageType: "",
    severity: "",
    diagnosis: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/inventaris").then(res => res.json()),
      fetch("/api/perbaikan/laporan").then(res => res.json())
    ]).then(([invRes, repRes]) => {
      if (invRes.data) setInventories(invRes.data);
      if (repRes.data) {
        const availableReports = repRes.data.filter((r: any) => r.status === "MENUNGGU" || r.id === initialReportId);
        setReports(availableReports);
        if (initialReportId) {
          const rep = availableReports.find((r: any) => r.id === initialReportId);
          if (rep) {
            setFormData(prev => ({
              ...prev,
              damageReportId: initialReportId,
              inventoryId: rep.inventoryId,
              diagnosis: `Tindak lanjut laporan ${rep.number}: ${rep.issue}`
            }));
          }
        }
      }
    }).catch(err => {
      console.error(err);
      toast.error("Gagal mengambil data master");
    });
  }, [initialReportId]);

  // When report changes, auto-select inventory
  useEffect(() => {
    if (formData.damageReportId) {
      const report = reports.find(r => r.id === formData.damageReportId);
      if (report) {
        setFormData(prev => ({ ...prev, inventoryId: report.inventoryId }));
      }
    }
  }, [formData.damageReportId, reports]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      const res = await fetch("/api/perbaikan/tiket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.error) {
        toast.error(json.error);
        setSubmitting(false);
        return;
      }

      toast.success("Tiket perbaikan berhasil dibuat");
      router.push("/dashboard/perbaikan");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-blue-600">Buat Tiket Perbaikan</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Tindak lanjuti laporan atau perbaikan langsung</p>
        </div>
      </div>

      <Card className="border-blue-500/20 shadow-sm shadow-blue-500/10">
        <CardHeader className="bg-blue-500/5 rounded-t-lg pb-4 border-b border-blue-500/10">
          <CardTitle className="text-blue-700 flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Detail Perbaikan
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="number">No. Tiket</Label>
                <Input id="number" required readOnly className="bg-muted" value={formData.number} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Tanggal Pembuatan</Label>
                <Input id="date" type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="report">Tindak Lanjut Laporan (Opsional)</Label>
              <select 
                id="report"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.damageReportId}
                onChange={(e) => setFormData({ ...formData, damageReportId: e.target.value })}
              >
                <option value="">-- Perbaikan Tanpa Laporan Awal --</option>
                {reports.map(rep => (
                  <option key={rep.id} value={rep.id}>
                    {rep.number} - {rep.inventory?.name} (Pelapor: {rep.reporter})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="inventory">Barang yang Diperbaiki *</Label>
              <select 
                id="inventory"
                required
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.inventoryId}
                onChange={(e) => setFormData({ ...formData, inventoryId: e.target.value })}
                disabled={!!formData.damageReportId}
              >
                <option value="">-- Pilih Barang --</option>
                {inventories.map(inv => (
                  <option key={inv.id} value={inv.id}>
                    {inv.code} - {inv.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="damageType">Jenis Kerusakan</Label>
                <select 
                  id="damageType"
                  required
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.damageType}
                  onChange={(e) => setFormData({ ...formData, damageType: e.target.value })}
                >
                  <option value="">Pilih Jenis</option>
                  <option value="HARDWARE">Hardware (Fisik / Komponen)</option>
                  <option value="SOFTWARE">Software (OS / Aplikasi)</option>
                  <option value="JARINGAN">Jaringan (Koneksi / Kabel)</option>
                  <option value="LAINNYA">Lainnya</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="severity">Tingkat Kerusakan</Label>
                <select 
                  id="severity"
                  required
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                >
                  <option value="">Pilih Tingkat</option>
                  <option value="RINGAN">Ringan (Bisa langsung selesai)</option>
                  <option value="SEDANG">Sedang (Butuh waktu analisa)</option>
                  <option value="BERAT">Berat (Butuh sparepart / ganti komponen)</option>
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="diagnosis">Diagnosa Awal Teknisi</Label>
              <Textarea
                id="diagnosis"
                rows={3}
                placeholder="Catat dugaan awal penyebab kerusakan..."
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              />
            </div>
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Buat Tiket Perbaikan"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
