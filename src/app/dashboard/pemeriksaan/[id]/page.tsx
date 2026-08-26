"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Save, XCircle, AlertCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDateShort } from "@/lib/utils";

export default function DetailPemeriksaanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [note, setNote] = useState("");

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/pemeriksaan/${id}`);
      const json = await res.json();
      
      if (json.data) {
        setRecord(json.data);
        setNote(json.data.note || "");
        setItems(json.data.items);
      } else {
        toast.error("Data tidak ditemukan");
        router.push("/dashboard/pemeriksaan");
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

  const handleUpdateItemStatus = (itemId: string, status: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, status } : item
    ));
  };

  const handleUpdateItemNote = (itemId: string, itemNote: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, note: itemNote } : item
    ));
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/pemeriksaan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, note }),
      });

      const json = await res.json();
      if (json.error) {
        toast.error(json.error);
        setSubmitting(false);
        return;
      }

      toast.success("Hasil pemeriksaan berhasil disimpan");
      fetchDetail(); // Refresh data
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!record) return null;

  const filteredItems = items.filter(item => 
    item.inventory.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.inventory.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: items.length,
    baik: items.filter(i => i.status === "ADA_BAIK").length,
    rusak: items.filter(i => i.status === "ADA_RUSAK").length,
    hilang: items.filter(i => i.status === "TIDAK_ADA").length,
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Checklist Inspeksi</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">{record.number} - {record.room.name}</p>
          </div>
        </div>
        
        <Button onClick={handleSave} disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-xs sm:text-sm h-9">
          <Save className="w-3.5 h-3.5 mr-1.5" />
          {submitting ? "Menyimpan..." : "Simpan Semua Hasil"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Info & Summary */}
        <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informasi Sesi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Ruangan</p>
                <p className="font-semibold text-sm">{record.room.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Tanggal</p>
                <p className="font-semibold text-sm">{formatDateShort(record.date)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Petugas / Inspector</p>
                <p className="font-semibold text-sm">{record.inspector.name}</p>
              </div>
              <div>
                <Label htmlFor="note" className="text-xs text-muted-foreground mb-1 block">Catatan Umum</Label>
                <Textarea 
                  id="note" 
                  rows={3} 
                  placeholder="Catatan kebersihan, suhu lab, dll..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ringkasan Hasil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-muted p-2 rounded-lg">
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Total Barang</p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 p-2 rounded-lg border border-emerald-100">
                  <p className="text-2xl font-bold">{stats.baik}</p>
                  <p className="text-[10px] uppercase font-semibold">Ada & Baik</p>
                </div>
                <div className="bg-amber-50 text-amber-700 p-2 rounded-lg border border-amber-100">
                  <p className="text-2xl font-bold">{stats.rusak}</p>
                  <p className="text-[10px] uppercase font-semibold">Ada (Rusak)</p>
                </div>
                <div className="bg-red-50 text-red-700 p-2 rounded-lg border border-red-100">
                  <p className="text-2xl font-bold">{stats.hilang}</p>
                  <p className="text-[10px] uppercase font-semibold">Hilang / Tdk Ada</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Checklist */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari kode atau nama barang..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              Menampilkan {filteredItems.length} barang
            </div>
          </div>

          <div className="rounded-md border bg-card divide-y">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Tidak ada barang yang cocok.</div>
            ) : (
              filteredItems.map(item => (
                <div key={item.id} className="p-4 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center hover:bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm leading-tight mb-1">{item.inventory.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{item.inventory.code}</span>
                      {item.inventory.position && (
                        <span className="text-[10px] text-muted-foreground">Lokasi: {item.inventory.position}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full xl:w-auto">
                    <div className="flex border rounded-lg overflow-hidden shrink-0">
                      <button 
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-colors
                          ${item.status === 'ADA_BAIK' ? 'bg-emerald-100 text-emerald-700' : 'bg-background hover:bg-muted text-muted-foreground'}`}
                        onClick={() => handleUpdateItemStatus(item.id, 'ADA_BAIK')}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> ADA (BAIK)
                      </button>
                      <div className="w-px bg-border"></div>
                      <button 
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-colors
                          ${item.status === 'ADA_RUSAK' ? 'bg-amber-100 text-amber-700' : 'bg-background hover:bg-muted text-muted-foreground'}`}
                        onClick={() => handleUpdateItemStatus(item.id, 'ADA_RUSAK')}
                      >
                        <AlertCircle className="w-3.5 h-3.5" /> ADA (RUSAK)
                      </button>
                      <div className="w-px bg-border"></div>
                      <button 
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-colors
                          ${item.status === 'TIDAK_ADA' ? 'bg-red-100 text-red-700' : 'bg-background hover:bg-muted text-muted-foreground'}`}
                        onClick={() => handleUpdateItemStatus(item.id, 'TIDAK_ADA')}
                      >
                        <XCircle className="w-3.5 h-3.5" /> TIDAK ADA
                      </button>
                    </div>

                    <Input 
                      placeholder="Catatan..." 
                      className="h-8 text-xs w-full sm:w-[150px]"
                      value={item.note || ""}
                      onChange={(e) => handleUpdateItemNote(item.id, e.target.value)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
