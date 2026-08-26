"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Wrench, AlertTriangle, FileText, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDateShort, CONDITIONS } from "@/lib/utils";

export default function DetailPerbaikanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    status: "",
    action: "",
    result: "",
    cost: "",
    finalCondition: "BAIK",
  });

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/perbaikan/tiket/${id}`);
      const json = await res.json();
      
      if (json.data) {
        setRecord(json.data);
        setFormData({
          status: json.data.status,
          action: json.data.action || "",
          result: json.data.result || "",
          cost: json.data.cost ? json.data.cost.toString() : "",
          finalCondition: json.data.inventory.condition || "BAIK",
        });
      } else {
        toast.error("Data tidak ditemukan");
        router.push("/dashboard/perbaikan");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.status === "SELESAI" && !confirm("Menyelesaikan tiket akan mengembalikan barang ke status AKTIF. Lanjutkan?")) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/perbaikan/tiket/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.error) {
        toast.error(json.error);
        setSubmitting(false);
        return;
      }

      toast.success("Tiket perbaikan berhasil diperbarui");
      fetchDetail();
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!record) return null;

  const isCompleted = record.status === "SELESAI";

  const getStatusColor = (s: string) => {
    if (s === "DIAGNOSA") return "bg-blue-100 text-blue-700";
    if (s === "PROSES") return "bg-purple-100 text-purple-700";
    if (s === "TESTING") return "bg-indigo-100 text-indigo-700";
    return "bg-emerald-100 text-emerald-700";
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Detail Tiket Perbaikan</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">{record.number}</p>
        </div>
        <div className={`ml-auto px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-bold text-xs sm:text-sm uppercase ${getStatusColor(record.status)}`}>
          {record.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Kolom Kiri: Info Laporan & Barang */}
        <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Barang</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Nama Barang</p>
                <p className="font-bold text-lg leading-tight">{record.inventory.name}</p>
                <p className="text-sm font-mono text-muted-foreground mt-1">{record.inventory.code}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Jenis Kerusakan</p>
                  <p className="font-semibold text-sm">{record.damageType || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tingkat</p>
                  <p className="font-semibold text-sm">{record.severity || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {record.damageReport && (
            <Card className="border-amber-500/20 shadow-sm shadow-amber-500/5">
              <CardHeader className="bg-amber-500/5 pb-4">
                <CardTitle className="text-amber-700 text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Berdasarkan Laporan
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <p className="text-xs text-amber-700/70 mb-1">Nomor Laporan</p>
                  <p className="font-semibold text-sm">{record.damageReport.number}</p>
                </div>
                <div>
                  <p className="text-xs text-amber-700/70 mb-1">Pelapor</p>
                  <p className="font-semibold text-sm">{record.damageReport.reporter}</p>
                </div>
                <div>
                  <p className="text-xs text-amber-700/70 mb-1">Keluhan Pelapor</p>
                  <p className="text-sm bg-amber-50 p-2 rounded-md">{record.damageReport.issue}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Diagnosa Awal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{record.diagnosis || "Tidak ada diagnosa awal dicatat."}</p>
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                Oleh Teknisi: <span className="font-semibold">{record.technician.name}</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Timeline Servis & Form Tindakan */}
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
          
          {/* Timeline Status Visual (Simple) */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex text-sm text-center">
                {["DIAGNOSA", "PROSES", "TESTING", "SELESAI"].map((step, idx) => {
                  const steps = ["DIAGNOSA", "PROSES", "TESTING", "SELESAI"];
                  const currentIdx = steps.indexOf(record.status);
                  const isPast = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  
                  return (
                    <div key={step} className={`flex-1 py-3 font-semibold border-b-4 flex items-center justify-center gap-1
                      ${isCurrent ? 'bg-primary/5 text-primary border-primary' : 
                        isPast ? 'bg-muted/50 text-foreground border-primary/30' : 'bg-background text-muted-foreground border-transparent'}`}>
                      {isPast && <CheckCircle2 className="w-3 h-3" />}
                      {step}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                Tindakan Perbaikan
              </CardTitle>
              <CardDescription>Catat semua tindakan, penggantian part, dan hasil akhir</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="grid gap-6">
                
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 grid gap-4">
                  <Label htmlFor="status" className="text-blue-900 font-bold">Update Status Tiket</Label>
                  <div className="flex flex-wrap gap-2">
                    {["DIAGNOSA", "PROSES", "TESTING", "SELESAI"].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => !isCompleted && setFormData(prev => ({ ...prev, status: s }))}
                        disabled={isCompleted}
                        className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all
                          ${formData.status === s 
                            ? getStatusColor(s) + ' border-transparent shadow-sm' 
                            : 'bg-background text-muted-foreground border-border hover:bg-muted'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="action">Detail Tindakan yang Dilakukan</Label>
                  <Textarea
                    id="action"
                    rows={4}
                    disabled={isCompleted}
                    placeholder="Misal: Membersihkan RAM, Install ulang OS, Mengganti kipas processor..."
                    value={formData.action}
                    onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="cost">Estimasi Biaya / Part (Rp)</Label>
                    <Input
                      id="cost"
                      type="number"
                      disabled={isCompleted}
                      placeholder="Opsional"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    />
                  </div>
                  
                  {formData.status === "SELESAI" && (
                    <div className="grid gap-2 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                      <Label htmlFor="finalCondition" className="text-emerald-800">Kondisi Akhir Barang *</Label>
                      <select 
                        id="finalCondition"
                        disabled={isCompleted}
                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                        value={formData.finalCondition}
                        onChange={(e) => setFormData({ ...formData, finalCondition: e.target.value })}
                      >
                        {CONDITIONS.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid gap-2 border-t pt-4">
                  <Label htmlFor="result">Hasil Akhir (Jika Selesai/Testing)</Label>
                  <Input
                    id="result"
                    disabled={isCompleted}
                    placeholder="Misal: Normal kembali, Masih sering lag, Tidak bisa diselamatkan"
                    value={formData.result}
                    onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  />
                </div>
                
                {!isCompleted && (
                  <Button type="submit" size="lg" className="w-full mt-2 bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                    {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                )}
                
                {isCompleted && (
                  <div className="p-4 bg-emerald-50 text-emerald-800 text-center rounded-xl font-bold border border-emerald-200">
                    Tiket Perbaikan Sudah Selesai pada {formatDateShort(record.completedAt)}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
