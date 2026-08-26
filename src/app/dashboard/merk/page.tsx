"use client";

import { useState, useEffect } from "react";
import { Layers, Plus, Edit, Trash2, X } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  _count: { inventories: number };
}

export default function MerkPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/merk");
      const data = await res.json();
      if (data.data) setBrands(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setModalOpen(true);
  };

  const openEditModal = (b: Brand) => {
    setEditingId(b.id);
    setName(b.name);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSubmitting(true);
    try {
      const url = editingId ? `/api/merk/${editingId}` : "/api/merk";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setModalOpen(false);
        fetchBrands();
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

  const handleDelete = async (id: string, bName: string) => {
    if (!confirm(`Hapus merk ${bName}?`)) return;
    try {
      const res = await fetch(`/api/merk/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchBrands();
      } else {
        const d = await res.json();
        alert(d.error || "Gagal menghapus merk");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Daftar Merk / Vendor</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Master data produsen dan pabrikan perangkat lab</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:brightness-110 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Tambah Merk
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {loading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">Memuat data...</div>
        ) : brands.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">Belum ada data merk.</div>
        ) : (
          brands.map((b) => (
            <div
              key={b.id}
              className="bg-card border border-border rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="min-w-0 pr-2">
                <h4 className="font-semibold text-foreground text-sm truncate">{b.name}</h4>
                <span className="text-[10px] text-muted-foreground">{b._count.inventories} Unit</span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button
                  onClick={() => openEditModal(b)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(b.id, b.name)}
                  className="p-1 text-muted-foreground hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-foreground">
                {editingId ? "Edit Merk" : "Tambah Merk Baru"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Nama Merk *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Kingston / Logitech"
                  required
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
