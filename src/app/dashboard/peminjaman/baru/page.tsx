"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Plus, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateCode, ROLES } from "@/lib/utils";

export default function BaruPeminjamanPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  
  const [inventories, setInventories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    number: generateCode("PJ", Math.floor(Math.random() * 1000)),
    date: new Date().toISOString().split("T")[0],
    borrower: "",
    role: "GURU",
    purpose: "",
    expectedReturn: "",
    note: "",
  });

  const [items, setItems] = useState<any[]>([]);
  const [selectedInventoryId, setSelectedInventoryId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (session?.user?.name && !formData.borrower) {
      setFormData(prev => ({
        ...prev,
        borrower: session.user.name || "",
        role: session.role || "GURU",
      }));
    }
  }, [session]);

  useEffect(() => {
    // Fetch items with stock > 0
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
      toast.error(`Stok tidak mencukupi. Sisa stok tersedia: ${inv.quantity}`);
      return;
    }

    // Check if already in items
    const existsIndex = items.findIndex(i => i.inventoryId === selectedInventoryId);
    if (existsIndex >= 0) {
      const currentQty = items[existsIndex].quantity;
      if (currentQty + qty > inv.quantity) {
        toast.error(`Total peminjaman melebihi stok yang ada (${inv.quantity})`);
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
        note: note,
      }]);
    }

    // Reset inputs
    setSelectedInventoryId("");
    setQuantity("1");
    setNote("");
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Pilih minimal 1 barang yang akan dipinjam");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/peminjaman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: items.map(i => ({
            inventoryId: i.inventoryId,
            quantity: i.quantity,
            note: i.note,
          }))
        }),
      });

      const json = await res.json();
      if (json.error) {
        toast.error(json.error);
        setSubmitting(false);
        return;
      }

      toast.success("Transaksi peminjaman berhasil dicatat");
      router.push("/dashboard/peminjaman");
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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-blue-600">Form Peminjaman</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Catat peminjaman barang oleh guru, siswa, atau staff</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
          <Card className="border-blue-500/20 shadow-sm shadow-blue-500/10">
            <CardHeader className="bg-blue-500/5 rounded-t-lg pb-4 border-b border-blue-500/10">
              <CardTitle className="text-blue-700 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Keranjang Peminjaman
              </CardTitle>
              <CardDescription>
                Pilih barang dan tentukan jumlah yang dipinjam.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Add Item Form */}
              <div className="flex flex-col sm:flex-row items-end gap-3 p-4 bg-muted/50 rounded-xl mb-4 border border-blue-500/20">
                <div className="grid gap-2 flex-1 w-full">
                  <Label>Pilih Barang (Stok Tersedia)</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={selectedInventoryId}
                    onChange={(e) => setSelectedInventoryId(e.target.value)}
                  >
                    <option value="">-- Pilih Barang --</option>
                    {inventories.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.code} - {inv.name} (Sisa: {inv.quantity})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2 w-full sm:w-24">
                  <Label>Jumlah</Label>
                  <Input 
                    type="number" min="1" 
                    value={quantity} onChange={(e) => setQuantity(e.target.value)} 
                  />
                </div>
                <Button type="button" onClick={handleAddItem} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                  <Plus className="h-4 w-4 sm:mr-1" /> <span className="sm:hidden">Tambah Barang</span>
                </Button>
              </div>

              {/* Items List */}
              {items.length > 0 ? (
                <div className="border border-blue-100 rounded-md divide-y divide-blue-100">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 bg-blue-50/30">
                      <div>
                        <p className="font-medium text-blue-900">{item.name}</p>
                        <p className="text-xs text-blue-600/70">{item.code}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-blue-700 px-3 py-1 bg-blue-100 rounded-md">{item.quantity} Unit</span>
                        <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:bg-red-100" onClick={() => handleRemoveItem(idx)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-blue-400 border rounded-md border-dashed border-blue-200 bg-blue-50/20">
                  Belum ada barang di keranjang.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Peminjam</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="number">No. Peminjaman</Label>
                <Input
                  id="number"
                  required
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Tanggal Pinjam</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              
              <div className="h-px bg-border my-2" />
              
              <div className="grid gap-2">
                <Label htmlFor="borrower">Nama Peminjam</Label>
                <Input
                  id="borrower"
                  placeholder="Nama Lengkap"
                  required
                  value={formData.borrower}
                  onChange={(e) => setFormData({ ...formData, borrower: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Jabatan / Peran</Label>
                <select 
                  id="role"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="GURU">Guru</option>
                  <option value="SISWA">Siswa</option>
                  <option value="STAFF">Staff / Karyawan</option>
                  <option value="LAINNYA">Lainnya</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purpose">Keperluan</Label>
                <Input
                  id="purpose"
                  placeholder="Praktikum kelas, lomba, dll"
                  required
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expectedReturn">Batas Waktu Pengembalian</Label>
                <Input
                  id="expectedReturn"
                  type="date"
                  value={formData.expectedReturn}
                  onChange={(e) => setFormData({ ...formData, expectedReturn: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="note">Keterangan Tambahan</Label>
                <Textarea
                  id="note"
                  rows={2}
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>
              
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full mt-4" disabled={submitting}>
                {submitting ? "Memproses..." : "Konfirmasi Pinjaman"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
