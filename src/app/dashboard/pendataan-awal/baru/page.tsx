"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ClipboardList,
  Building2,
  Calendar,
  Layers,
} from "lucide-react";

interface InitialItemRow {
  code: string;
  name: string;
  category: string;
  brand: string;
  specification: string;
  quantity: number;
  condition: string;
  location: string;
  checkStatus: string;
  note: string;
}

export default function BaruPendataanAwalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);

  // Session header
  const [number, setNumber] = useState(`PA-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-001`);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [roomId, setRoomId] = useState("");
  const [note, setNote] = useState("");

  // Items table
  const [items, setItems] = useState<InitialItemRow[]>([
    {
      code: "PC-RPL1-001",
      name: "PC Desktop Siswa 01",
      category: "Komputer",
      brand: "ASUS",
      specification: "Core i5, RAM 8GB, SSD 256GB",
      quantity: 1,
      condition: "BAIK",
      location: "Meja 1",
      checkStatus: "SUDAH_DICEK",
      note: "Lengkap keyboard & mouse",
    },
    {
      code: "PC-RPL1-002",
      name: "PC Desktop Siswa 02",
      category: "Komputer",
      brand: "ASUS",
      specification: "Core i5, RAM 8GB, SSD 256GB",
      quantity: 1,
      condition: "BAIK",
      location: "Meja 2",
      checkStatus: "SUDAH_DICEK",
      note: "Lengkap keyboard & mouse",
    },
  ]);

  useEffect(() => {
    async function loadRooms() {
      try {
        const res = await fetch("/api/ruangan");
        const data = await res.json();
        if (data.data) {
          setRooms(data.data);
          if (data.data.length > 0) setRoomId(data.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadRooms();
  }, []);

  const addItemRow = () => {
    const nextIdx = items.length + 1;
    setItems([
      ...items,
      {
        code: `PC-RPL1-${String(nextIdx).padStart(3, "0")}`,
        name: `PC Desktop Siswa ${String(nextIdx).padStart(2, "0")}`,
        category: "Komputer",
        brand: "ASUS",
        specification: "Core i5, RAM 8GB, SSD 256GB",
        quantity: 1,
        condition: "BAIK",
        location: `Meja ${nextIdx}`,
        checkStatus: "SUDAH_DICEK",
        note: "",
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItemRow = (index: number, field: keyof InitialItemRow, val: any) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: val };
    setItems(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!number || !roomId) {
      alert("Nomor pendataan dan ruangan wajib diisi!");
      return;
    }
    if (items.length === 0) {
      alert("Tambahkan minimal 1 item barang!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/pendataan-awal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number,
          date,
          roomId,
          note,
          items,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/dashboard/pendataan-awal/${data.data.id}`);
      } else {
        alert(data.error || "Gagal menyimpan pendataan awal");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/pendataan-awal"
          className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Formulir Pendataan Awal Toolman</h1>
          <p className="text-muted-foreground text-sm">
            Catat inventarisasi fisik barang per laboratorium pada awal masa tugas
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Information Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2 pb-3 border-b border-border">
            <ClipboardList className="w-4 h-4 text-primary" />
            Informasi Dokumen Pendataan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Nomor Dokumen *
              </label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-border bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Tanggal Pemeriksaan *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Laboratorium / Ruangan *
              </label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
              Catatan Kondisi Awal Ruangan
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Catatan kebersihan, suhu AC, jumlah kabel LAN, dll..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Multi-Item Table Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Daftar Barang yang Diperiksa ({items.length} Item)
            </h3>
            <button
              type="button"
              onClick={addItemRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Baris Barang
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="p-2.5">Kode</th>
                  <th className="p-2.5">Nama Barang</th>
                  <th className="p-2.5">Spesifikasi</th>
                  <th className="p-2.5">Posisi</th>
                  <th className="p-2.5">Kondisi</th>
                  <th className="p-2.5">Status Cek</th>
                  <th className="p-2.5">Catatan</th>
                  <th className="p-2.5 text-center">Hapus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="p-2">
                      <input
                        type="text"
                        value={it.code}
                        onChange={(e) => updateItemRow(idx, "code", e.target.value)}
                        className="w-28 px-2 py-1 font-mono rounded-lg border border-border bg-muted/20"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={it.name}
                        onChange={(e) => updateItemRow(idx, "name", e.target.value)}
                        className="w-36 px-2 py-1 rounded-lg border border-border bg-muted/20"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={it.specification}
                        onChange={(e) => updateItemRow(idx, "specification", e.target.value)}
                        className="w-40 px-2 py-1 rounded-lg border border-border bg-muted/20"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={it.location}
                        onChange={(e) => updateItemRow(idx, "location", e.target.value)}
                        className="w-24 px-2 py-1 rounded-lg border border-border bg-muted/20"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={it.condition}
                        onChange={(e) => updateItemRow(idx, "condition", e.target.value)}
                        className="px-2 py-1 rounded-lg border border-border bg-muted/20"
                      >
                        <option value="BAIK">Baik</option>
                        <option value="RUSAK_RINGAN">Rusak Ringan</option>
                        <option value="RUSAK_BERAT">Rusak Berat</option>
                        <option value="TIDAK_DITEMUKAN">Tidak Ditemukan</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <select
                        value={it.checkStatus}
                        onChange={(e) => updateItemRow(idx, "checkStatus", e.target.value)}
                        className="px-2 py-1 rounded-lg border border-border bg-muted/20"
                      >
                        <option value="SUDAH_DICEK">Sudah Dicek</option>
                        <option value="BELUM_DICEK">Belum Dicek</option>
                        <option value="PERLU_PERBAIKAN">Perlu Perbaikan</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={it.note}
                        onChange={(e) => updateItemRow(idx, "note", e.target.value)}
                        placeholder="Keterangan..."
                        className="w-36 px-2 py-1 rounded-lg border border-border bg-muted/20"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="p-1 text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/dashboard/pendataan-awal"
            className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted text-muted-foreground"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "Menyimpan..." : "Simpan Pendataan Awal"}
          </button>
        </div>
      </form>
    </div>
  );
}
