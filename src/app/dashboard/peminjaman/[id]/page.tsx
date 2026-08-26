"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, Package, User as UserIcon, Calendar, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDateShort, CONDITIONS } from "@/lib/utils";

export default function DetailPeminjamanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [returnItems, setReturnItems] = useState<any[]>([]);
  const [returnNote, setReturnNote] = useState("");

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/peminjaman/${id}`);
      const json = await res.json();
      
      if (json.data) {
        setRecord(json.data);
        // Initialize return items state
        setReturnItems(json.data.items.map((item: any) => ({
          id: item.id,
          inventoryId: item.inventoryId,
          name: item.inventory.name,
          code: item.inventory.code,
          quantity: item.quantity,
          returnCondition: "BAIK", // Default return condition
        })));
      } else {
        toast.error("Data tidak ditemukan");
        router.push("/dashboard/peminjaman");
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

  const handleReturnConditionChange = (itemId: string, condition: string) => {
    setReturnItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, returnCondition: condition } : item
    ));
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("Konfirmasi pengembalian barang. Stok akan otomatis bertambah dan kondisi akan diperbarui. Lanjutkan?")) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/peminjaman/${id}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: returnItems,
          note: returnNote,
        }),
      });

      const json = await res.json();
      if (json.error) {
        toast.error(json.error);
        setSubmitting(false);
        return;
      }

      toast.success("Barang berhasil dikembalikan");
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

  const isLate = record.status === "DIPINJAM" && record.expectedReturn && new Date(record.expectedReturn) < new Date();
  const isReturned = record.status === "DIKEMBALIKAN";

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Detail Peminjaman</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">{record.number}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Info Transaksi */}
        <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 text-center bg-muted/50 rounded-lg border">
                {isReturned ? (
                  <>
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
                    <h3 className="text-xl font-bold text-emerald-600">SELESAI</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Dikembalikan pada {formatDateShort(record.actualReturn)}
                    </p>
                  </>
                ) : (
                  <>
                    <Clock className={`w-12 h-12 mb-2 ${isLate ? "text-red-500" : "text-blue-500"}`} />
                    <h3 className={`text-xl font-bold ${isLate ? "text-red-600" : "text-blue-600"}`}>
                      {isLate ? "TERLAMBAT" : "DIPINJAM"}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tenggat: {record.expectedReturn ? formatDateShort(record.expectedReturn) : "Tidak ada"}
                    </p>
                  </>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                    <UserIcon className="w-4 h-4" /> Peminjam
                  </p>
                  <p className="font-medium">{record.borrower} <span className="text-xs font-normal text-muted-foreground">({record.role})</span></p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                    <CheckSquare className="w-4 h-4" /> Keperluan
                  </p>
                  <p className="font-medium">{record.purpose}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4" /> Tgl Pinjam
                  </p>
                  <p className="font-medium">{formatDateShort(record.date)}</p>
                </div>
                {record.note && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Catatan</p>
                    <p className="text-sm whitespace-pre-wrap">{record.note}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* List Barang & Form Pengembalian */}
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Daftar Barang ({record.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isReturned ? (
                <form onSubmit={handleReturn} className="flex flex-col gap-6">
                  <div className="rounded-md border divide-y">
                    {returnItems.map((item, idx) => (
                      <div key={item.id} className="p-4 flex flex-col gap-4 bg-muted/20">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.code}</p>
                          </div>
                          <span className="font-bold px-3 py-1 bg-primary/10 text-primary rounded-md">
                            {item.quantity} Unit
                          </span>
                        </div>
                        
                        <div className="bg-background p-3 rounded-md border flex items-center justify-between">
                          <Label className="font-semibold text-blue-600">Kondisi saat kembali:</Label>
                          <select 
                            className="flex h-9 w-[200px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                            value={item.returnCondition}
                            onChange={(e) => handleReturnConditionChange(item.id, e.target.value)}
                          >
                            {CONDITIONS.map(c => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-2">
                    <Label>Catatan Pengembalian (Opsional)</Label>
                    <Textarea 
                      rows={3}
                      placeholder="Catatan jika ada barang hilang, rusak, atau telat kembali..."
                      value={returnNote}
                      onChange={(e) => setReturnNote(e.target.value)}
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                    {submitting ? "Memproses..." : "Konfirmasi Pengembalian"}
                  </Button>
                </form>
              ) : (
                <div className="rounded-md border divide-y">
                  {record.items.map((item: any) => (
                    <div key={item.id} className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-semibold">{item.inventory.name}</p>
                        <p className="text-sm text-muted-foreground">{item.inventory.code}</p>
                      </div>
                      <div className="text-right">
                        <span className="block font-bold mb-1">{item.quantity} Unit</span>
                        {item.returnCondition && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase
                            ${item.returnCondition === 'BAIK' ? 'bg-emerald-100 text-emerald-700' : 
                              item.returnCondition.includes('RUSAK') ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                            Kondisi Kembali: {item.returnCondition.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
