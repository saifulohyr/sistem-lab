"use client";

import { useState, useEffect } from "react";
import { Building2, Plus, Edit, Trash2, X, Check } from "lucide-react";

interface Room {
  id: string;
  name: string;
  capacity: number | null;
  note: string | null;
  _count: { inventories: number };
}

export default function RuanganPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ruangan");
      const data = await res.json();
      if (data.data) setRooms(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setCapacity("");
    setNote("");
    setModalOpen(true);
  };

  const openEditModal = (r: Room) => {
    setEditingId(r.id);
    setName(r.name);
    setCapacity(r.capacity ? r.capacity.toString() : "");
    setNote(r.note || "");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSubmitting(true);
    try {
      const url = editingId ? `/api/ruangan/${editingId}` : "/api/ruangan";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, capacity, note }),
      });
      if (res.ok) {
        setModalOpen(false);
        fetchRooms();
      } else {
        const d = await res.json();
        alert(d.error || "Gagal menyimpan");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, rName: string) => {
    if (!confirm(`Hapus ruangan ${rName}?`)) return;
    try {
      const res = await fetch(`/api/ruangan/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchRooms();
      } else {
        const d = await res.json();
        alert(d.error || "Gagal menghapus ruangan");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Kelola Ruangan Lab</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Daftar ruangan laboratorium komputer dan gudang</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:brightness-110 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Tambah Ruangan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">Memuat data...</div>
        ) : rooms.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">Belum ada data ruangan.</div>
        ) : (
          rooms.map((r) => (
            <div
              key={r.id}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                    {r._count.inventories} Barang
                  </span>
                </div>
                <h3 className="font-bold text-foreground text-lg">{r.name}</h3>
                {r.capacity && (
                  <p className="text-xs text-muted-foreground mt-0.5">Kapasitas: {r.capacity} Meja/Siswa</p>
                )}
                {r.note && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{r.note}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-4 mt-4 border-t border-border">
                <button
                  onClick={() => openEditModal(r)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(r.id, r.name)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-foreground">
                {editingId ? "Edit Ruangan" : "Tambah Ruangan Baru"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Nama Ruangan *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Lab RPL 4"
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Kapasitas (Meja/PC)
                </label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="Contoh: 36"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Keterangan / Lokasi Gedung
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Gedung Utama Lantai 2..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-muted-foreground"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
