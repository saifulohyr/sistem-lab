"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateCode } from "@/lib/utils";

export default function BaruBarangKeluarPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  const [inventories, setInventories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    number: generateCode("BK", Math.floor(Math.random() * 1000)),
    date: new Date().toISOString().split("T")[0],
    type: "PENGHAPUSAN",
    destination: "",
    note: "",
  });

  const [items, setItems] = useState<any[]>([]);
  const [selectedInventoryId, setSelectedInventoryId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");

  useEffect(() => {
    // Only fetch items with stock > 0
    fetch("/api/inventaris")
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setInventories(data.data.filter((inv: any) => inv.quantity > 0));
        }
      })
      .catch(err => {
        console.error(err);
        toast.error("Gagal mengambil data inventaris");
      });
  }, []);

  const handleAddItem = () => {
    if (!selectedInventoryId) {
      toast.error("Pilih barang terlebih dahulu");
      return;
    }
    const inv = inventories.find(i => i.id === selectedInventoryId);
    if (!inv) return;

    const qty = parseInt(quantity);
    if (qty > inv.quantity) {
      toast.error(`Stok tidak mencukupi. Sisa stok: ${inv.quantity}`);
      return;
    }

    // Check if already in items
    const existsIndex = items.findIndex(i => i.inventoryId === selectedInventoryId);
    if (existsIndex >= 0) {
      const currentQty = items[existsIndex].quantity;
      if (currentQty + qty > inv.quantity) {
        toast.error(`Total pengeluaran melebihi stok yang ada (${inv.quantity})`);
        return;
      }
      const newItems = [...items];
      newItems[existsIndex].quantity += qty;
      setItems(newItems);
    } else {
      setItems([...items, {
        inventoryId: selectedInventoryId,
        name: inv.name,
        code: inv.code,
        quantity: qty,
        maxStock: inv.quantity,
        reason: reason,
      }]);
    }

    // Reset inputs
    setSelectedInventoryId("");
    setQuantity("1");
    setReason("");
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Minimal harus ada 1 barang yang dikeluarkan");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/barang-keluar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: items.map(i => ({
            inventoryId: i.inventoryId,
            quantity: i.quantity,
            reason: i.reason,
          }))
        }),
      });

      const json = await res.json();
      if (json.error) {
        toast.error(json.error);
        setSubmitting(false);
        return;
      }

      toast.success("Transaksi barang keluar berhasil dicatat");
      router.push("/dashboard/barang-keluar");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-red-600">Catat Barang Keluar</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Kurangi stok atau hapus barang dari inventaris</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
          <Card className="border-red-500/20 shadow-sm shadow-red-500/10">
            <CardHeader className="bg-red-500/5 rounded-t-lg pb-4 border-b border-red-500/10">
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Daftar Barang yang Dikeluarkan
              </CardTitle>
              <CardDescription>
                Barang yang dimasukkan ke sini akan dikurangi jumlahnya dari stok gudang/lab.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Add Item Form */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 p-3 sm:p-4 bg-muted/50 rounded-xl mb-4 border border-red-500/20">
                <div className="grid gap-2 flex-1 w-full">
                  <Label>Pilih Barang (Stok {'>'} 0)</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={selectedInventoryId}
                    onChange={(e) => setSelectedInventoryId(e.target.value)}
                  >
                    <option value="">-- Pilih Barang --</option>
                    {inventories.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.code} - {inv.name} (Stok: {inv.quantity})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2 w-24">
                  <Label>Jumlah</Label>
                  <Input 
                    type="number" min="1" 
                    value={quantity} onChange={(e) => setQuantity(e.target.value)} 
                  />
                </div>
                <Button type="button" onClick={handleAddItem} variant="outline" className="border-red-200 hover:bg-red-50 hover:text-red-600">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>

              {/* Items List */}
              {items.length > 0 ? (
                <div className="border border-red-100 rounded-md divide-y divide-red-100">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 bg-red-50/30">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.code} — <span className="text-red-600 font-medium">-{item.quantity} Unit</span></p>
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:bg-red-100" onClick={() => handleRemoveItem(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-red-400 border rounded-md border-dashed border-red-200">
                  Belum ada barang yang ditambahkan.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Transaksi</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="number">No. Dokumen</Label>
                <Input
                  id="number"
                  required
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Tanggal Keluar</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Jenis Pengeluaran</Label>
                <select 
                  id="type"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="PENGHAPUSAN">Penghapusan / Pemusnahan</option>
                  <option value="HIBAB">Hibah / Sumbangan</option>
                  <option value="RUSAK_TOTAL">Rusak Total / Tidak Bisa Diperbaiki</option>
                  <option value="HILANG">Hilang</option>
                  <option value="LAINNYA">Lainnya</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="destination">Tujuan / Pihak Penerima (Opsional)</Label>
                <Input
                  id="destination"
                  placeholder="Misal: Sekolah lain, Gudang Pusat"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="note">Keterangan / Alasan</Label>
                <Textarea
                  id="note"
                  rows={3}
                  placeholder="Penjelasan detail mengapa barang dikeluarkan"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>
              
              <Button type="submit" variant="destructive" disabled={submitting} className="w-full mt-4">
                {submitting ? "Memproses..." : "Keluarkan Barang"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
