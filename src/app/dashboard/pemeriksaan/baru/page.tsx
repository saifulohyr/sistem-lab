"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function BaruPemeriksaanPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    roomId: "",
    note: "",
  });

  useEffect(() => {
    fetch("/api/ruangan")
      .then(res => res.json())
      .then(data => {
        if (data.data) setRooms(data.data);
      })
      .catch(() => toast.error("Gagal mengambil data ruangan"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      const res = await fetch("/api/pemeriksaan", {
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

      toast.success("Sesi pemeriksaan berhasil dibuat");
      router.push(`/dashboard/pemeriksaan/${json.data.id}`); // Langsung buka form detail
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-indigo-600">Sesi Pemeriksaan Baru</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Buat sesi inspeksi untuk ruangan lab tertentu</p>
        </div>
      </div>

      <Card className="border-indigo-500/20 shadow-sm shadow-indigo-500/5">
        <CardHeader className="bg-indigo-500/5 rounded-t-lg pb-4 border-b border-indigo-500/10">
          <CardTitle className="text-indigo-700 flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            Informasi Pemeriksaan
          </CardTitle>
          <CardDescription>
            Sistem akan otomatis mengambil semua barang AKTIF di ruangan ini untuk dibuatkan checklist.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="date">Tanggal Inspeksi</Label>
              <Input id="date" type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="room">Pilih Ruangan yang Akan Diperiksa *</Label>
              <select 
                id="room"
                required
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.roomId}
                onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
              >
                <option value="">-- Pilih Ruangan --</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name} {room.location ? `(${room.location.name})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="note">Catatan / Keterangan Sesi (Opsional)</Label>
              <Textarea
                id="note"
                rows={3}
                placeholder="Misal: Pemeriksaan rutin akhir semester genap 2026..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              />
            </div>
            
            <Button type="submit" size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2" disabled={submitting}>
              {submitting ? "Memproses..." : "Buat Sesi & Mulai Checklist"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
