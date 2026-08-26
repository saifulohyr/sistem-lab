"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateCode } from "@/lib/utils";

export default function LaporKerusakanPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  
  const [inventories, setInventories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    number: generateCode("REP", Math.floor(Math.random() * 10000)),
    date: new Date().toISOString().split("T")[0],
    reporter: "",
    inventoryId: "",
    issue: "",
    photoUrl: "",
  });

  useEffect(() => {
    if (session?.user?.name && !formData.reporter) {
      setFormData(prev => ({
        ...prev,
        reporter: session.user.name || "",
      }));
    }
  }, [session]);

  useEffect(() => {
    // Fetch only active items that are not currently in repair
    fetch("/api/inventaris")
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setInventories(data.data.filter((inv: any) => inv.status === "AKTIF" || inv.status === "DIPINJAM"));
        }
      })
      .catch(err => {
        console.error(err);
        toast.error("Gagal mengambil data inventaris");
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      const res = await fetch("/api/perbaikan/laporan", {
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

      toast.success("Laporan kerusakan berhasil dikirim");
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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-amber-600">Lapor Kerusakan</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Laporkan barang lab yang rusak atau bermasalah</p>
        </div>
      </div>

      <Card className="border-amber-500/20 shadow-sm shadow-amber-500/10">
        <CardHeader className="bg-amber-500/5 rounded-t-lg pb-4 border-b border-amber-500/10">
          <CardTitle className="text-amber-700 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Formulir Kerusakan
          </CardTitle>
          <CardDescription>
            Setelah laporan dikirim, status barang otomatis berubah menjadi "PERBAIKAN" dan menunggu dicek teknisi.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="number">No. Tiket Laporan</Label>
                <Input
                  id="number"
                  required
                  readOnly
                  className="bg-muted"
                  value={formData.number}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reporter">Nama Pelapor</Label>
              <Input
                id="reporter"
                placeholder="Nama Lengkap (Contoh: Budi - Guru RPL)"
                required
                value={formData.reporter}
                onChange={(e) => setFormData({ ...formData, reporter: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="inventory">Barang yang Rusak</Label>
              <select 
                id="inventory"
                required
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.inventoryId}
                onChange={(e) => setFormData({ ...formData, inventoryId: e.target.value })}
              >
                <option value="">-- Cari dan Pilih Barang --</option>
                {inventories.map(inv => (
                  <option key={inv.id} value={inv.id}>
                    {inv.code} - {inv.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="issue">Keluhan / Detail Kerusakan</Label>
              <Textarea
                id="issue"
                rows={4}
                required
                placeholder="Jelaskan secara detail masalah yang terjadi (Misal: PC sering restart sendiri saat buka VSCode, keyboard tidak respon, dll)"
                value={formData.issue}
                onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
              />
            </div>
            
            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={submitting}>
              {submitting ? "Mengirim Laporan..." : "Kirim Laporan Kerusakan"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
