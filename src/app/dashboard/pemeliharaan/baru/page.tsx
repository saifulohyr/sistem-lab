"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateCode } from "@/lib/utils";

export default function FormPemeliharaanPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    number: generateCode("MNT", Math.floor(Math.random() * 10000)),
    date: new Date().toISOString().split("T")[0],
    type: "PREVENTIVE",
    title: "",
    description: "",
    result: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      const res = await fetch("/api/pemeliharaan", {
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

      toast.success("Catatan pemeliharaan berhasil disimpan");
      router.push("/dashboard/pemeliharaan");
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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-emerald-600">Catat Pemeliharaan</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Dokumentasikan kegiatan pemeliharaan lab (Pembersihan, update OS, dll)</p>
        </div>
      </div>

      <Card className="border-emerald-500/20 shadow-sm shadow-emerald-500/5">
        <CardHeader className="bg-emerald-500/5 rounded-t-lg pb-4 border-b border-emerald-500/10">
          <CardTitle className="text-emerald-700 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Detail Kegiatan
          </CardTitle>
          <CardDescription>
            Pemeliharaan preventif (pencegahan/rutin) atau corrective (tindakan koreksi setelah ada kendala ringan).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="number">No. Dokumen</Label>
                <Input id="number" required readOnly className="bg-muted" value={formData.number} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Tanggal Kegiatan</Label>
                <Input id="date" type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Jenis</Label>
                <select 
                  id="type"
                  required
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="PREVENTIVE">Preventive (Rutin)</option>
                  <option value="CORRECTIVE">Corrective (Perbaikan Ringan)</option>
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Judul Kegiatan / Pekerjaan *</Label>
              <Input
                id="title"
                required
                placeholder="Contoh: Pembersihan debu PC Lab RPL 1, Update Windows 11 Serentak"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi Lengkap *</Label>
              <Textarea
                id="description"
                rows={4}
                required
                placeholder="Jelaskan detail apa saja yang dilakukan, barang/komputer mana saja yang dikerjakan..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="result">Hasil Akhir (Opsional)</Label>
              <Input
                id="result"
                placeholder="Contoh: Semua PC normal, Suhu CPU stabil"
                value={formData.result}
                onChange={(e) => setFormData({ ...formData, result: e.target.value })}
              />
            </div>
            
            <Button type="submit" size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan Catatan Pemeliharaan"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
