"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Edit, Trash2, X, Shield, CheckCircle, XCircle } from "lucide-react";
import { getRoleLabel } from "@/lib/utils";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("TOOLMAN");
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.data) setUsers(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("TOOLMAN");
    setActive(true);
    setModalOpen(true);
  };

  const openEditModal = (u: UserItem) => {
    setEditingId(u.id);
    setName(u.name);
    setEmail(u.email);
    setPassword("");
    setRole(u.role);
    setActive(u.active);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingId ? `/api/users/${editingId}` : "/api/users";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: password || undefined, role, active }),
      });
      if (res.ok) {
        setModalOpen(false);
        fetchUsers();
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

  const handleDelete = async (id: string, uName: string) => {
    if (!confirm(`Hapus akun ${uName}?`)) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchUsers();
      } else {
        const d = await res.json();
        alert(d.error || "Gagal menghapus");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Pengguna & Hak Akses</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Kelola akun Admin, Toolman, Guru, dan Siswa</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:brightness-110 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Tambah Pengguna
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[600px]">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role Akses</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">Memuat data...</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-foreground">{u.name}</td>
                    <td className="py-3.5 px-4 font-mono text-muted-foreground text-xs">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        <Shield className="w-3 h-3" />
                        {getRoleLabel(u.role)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.active ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                          <XCircle className="w-3.5 h-3.5" />
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-foreground">
                {editingId ? "Edit Pengguna" : "Tambah Pengguna Baru"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Email Login *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  {editingId ? "Password Baru (Kosongkan jika tidak diubah)" : "Password *"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!editingId}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Role Akses
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="TOOLMAN">Toolman</option>
                  <option value="GURU">Guru</option>
                  <option value="SISWA">Siswa</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="userActive"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="userActive" className="text-sm font-medium text-foreground">
                  Akun Aktif
                </label>
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
