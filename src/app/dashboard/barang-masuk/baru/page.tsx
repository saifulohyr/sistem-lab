"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateCode } from "@/lib/utils";

export default function BaruBarangMasukPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [inventories, setInventories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    number: generateCode("BM", Math.floor(Math.random() * 1000)),
    date: new Date().toISOString().split("T")[0],
    supplierId: "",
    source: "",
    documentNo: "",
    note: "",
  });

  const [items, setItems] = useState<any[]>([]);
  const [selectedInventoryId, setSelectedInventoryId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [itemNote, setItemNote] = useState("");

  useEffect(() => {
    // Fetch suppliers and inventory list for dropdown
    Promise.all([
      fetch("/api/supplier").then(res => res.json()),
      fetch("/api/inventaris").then(res => res.json())
    ]).then(([supplierData, inventoryData]) => {
      if (supplierData.data) setSuppliers(supplierData.data);
      if (inventoryData.data) setInventories(inventoryData.data);
    }).catch(err => {
      console.error(err);
      toast.error("Gagal mengambil data master");
    });
  }, []);

  const handleAddItem = () => {
    if (!selectedInventoryId) {
      toast.error("Pilih barang terlebih dahulu");
      return;
    }
    const inv = inventories.find(i => i.id === selectedInventoryId);
    if (!inv) return;

    // Check if already in items
    const existsIndex = items.findIndex(i => i.inventoryId === selectedInventoryId);
    if (existsIndex >= 0) {
      const newItems = [...items];
      newItems[existsIndex].quantity += parseInt(quantity);
      if (price) newItems[existsIndex].price = price;
      setItems(newItems);
    } else {
      setItems([...items, {
        inventoryId: selectedInventoryId,
        name: inv.name,
        code: inv.code,
        quantity: parseInt(quantity),
        price: price ? parseFloat(price) : null,
        note: itemNote,
      }]);
    }

    // Reset inputs
    setSelectedInventoryId("");
    setQuantity("1");
    setPrice("");
    setItemNote("");
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Minimal harus ada 1 barang yang dimasukkan");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/barang-masuk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: items.map(i => ({
            inventoryId: i.inventoryId,
            quantity: i.quantity,
            price: i.price,
            note: i.note
          }))
        }),
      });

      const json = await res.json();
      if (json.error) {
        toast.error(json.error);
        setSubmitting(false);
        return;
      }

      toast.success("Transaksi barang masuk berhasil dicatat");
      router.push("/dashboard/barang-masuk");
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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Catat Barang Masuk</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Tambah stok untuk barang yang sudah terdaftar</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Barang yang Masuk</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add Item Form */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 p-3 sm:p-4 bg-muted/50 rounded-xl mb-4 border">
                <div className="grid gap-2 flex-1 w-full">
                  <Label>Pilih Barang</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={selectedInventoryId}
                    onChange={(e) => setSelectedInventoryId(e.target.value)}
                  >
                    <option value="">-- Pilih Barang --</option>
                    {inventories.map(inv => (
                      <option key={inv.id} value={inv.id}>{inv.code} - {inv.name}</option>
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
                <div className="grid gap-2 w-32">
                  <Label>Harga Satuan</Label>
                  <Input 
                    type="number" placeholder="Opsional" 
                    value={price} onChange={(e) => setPrice(e.target.value)} 
                  />
                </div>
                <Button type="button" onClick={handleAddItem} className="gap-2">
                  <Plus className="h-4 w-4" /> Tambah
                </Button>
              </div>

              {/* Items List */}
              {items.length > 0 ? (
                <div className="border rounded-md divide-y">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.code}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-semibold">{item.quantity} Unit</p>
                          {item.price && (
                            <p className="text-xs text-muted-foreground">Rp {item.price.toLocaleString('id-ID')}</p>
                          )}
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveItem(idx)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-md border-dashed">
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
                <Label htmlFor="number">No. Dokumen / Referensi</Label>
                <Input
                  id="number"
                  required
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Tanggal Masuk</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supplier">Supplier (Opsional)</Label>
                <select 
                  id="supplier"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                >
                  <option value="">-- Tanpa Supplier --</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="source">Sumber Dana (Jika ada)</Label>
                <Input
                  id="source"
                  placeholder="BOS, Bantuan, dll"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="note">Keterangan Tambahan</Label>
                <Textarea
                  id="note"
                  rows={3}
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>
              
              <Button type="submit" disabled={submitting} className="w-full mt-4">
                {submitting ? "Menyimpan..." : "Simpan Transaksi"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
