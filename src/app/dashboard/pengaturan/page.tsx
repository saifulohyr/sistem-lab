"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { User, Key, Shield, Info, CheckCircle2, Server, Database, Laptop, Lock } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getRoleLabel } from "@/lib/utils";

export default function PengaturanPage() {
  const { data: session, update } = useSession();
  const user = session?.user as any;

  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok");
      return;
    }

    if (!user?.id) {
      toast.error("Sesi tidak valid");
      return;
    }

    setSaving(true);
    try {
      const payload: any = { name };
      if (password) payload.password = password;

      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Profil berhasil diperbarui");
        setPassword("");
        setConfirmPassword("");
        if (update) update();
      } else {
        toast.error(json.error || "Gagal memperbarui profil");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-5xl mx-auto w-full">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Pengaturan Akun & Sistem</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">Kelola informasi profil, keamanan akun, dan informasi aplikasi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column: Profile Card & System Info */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          {/* Profile Overview */}
          <Card className="overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <CardContent className="pt-0 relative px-6 pb-6 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-900 border-4 border-card text-white flex items-center justify-center text-xl font-bold mx-auto -mt-8 shadow-md">
                {user?.name?.charAt(0) || "U"}
              </div>
              <h2 className="font-bold text-lg mt-3">{user?.name || "Pengguna"}</h2>
              <p className="text-xs text-muted-foreground">{user?.email || "-"}</p>
              <div className="mt-3">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-xs font-semibold uppercase">
                  {getRoleLabel(user?.role || "")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-600" />
                Informasi Sistem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Aplikasi:</span>
                <span className="font-semibold">LABMUMA v0.1.0</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Framework:</span>
                <span className="font-semibold">Next.js 16 (React 19)</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Database ORM:</span>
                <span className="font-semibold">Prisma Client</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Database Engine:</span>
                <span className="font-semibold">PostgreSQL</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Status Server:</span>
                <span className="font-semibold text-emerald-600">Online (Connected)</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Edit Profile & Password Form */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Perbarui Profil & Kata Sandi
              </CardTitle>
              <CardDescription>
                Ubah nama tampilan atau ganti kata sandi akun Anda untuk meningkatkan keamanan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Lengkap Anda"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    disabled
                    value={user?.email || ""}
                    className="bg-muted text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-[11px] text-muted-foreground">Email terdaftar tidak dapat diubah sendiri.</p>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600" />
                    Ganti Kata Sandi (Opsional)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Biarkan kosong jika Anda tidak ingin mengubah kata sandi saat ini.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Kata Sandi Baru</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi kata sandi baru"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Role Permissions Matrix Guide */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Hak Akses Berdasarkan Role
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-muted/40 rounded-lg border">
                  <span className="font-bold text-foreground block mb-1 text-red-600">Admin</span>
                  Akses penuh ke seluruh modul, master data, manajemen pengguna, hapus riwayat, dan pengesahan laporan.
                </div>
                <div className="p-3 bg-muted/40 rounded-lg border">
                  <span className="font-bold text-foreground block mb-1 text-blue-600">Toolman (Teknisi Lab)</span>
                  Pengelolaan inventaris barang, mutasi, transaksi peminjaman, tiket perbaikan, pemeliharaan lab, pengesahan pendataan awal & berita acara, monitoring statistik, serta cetak rekapitulasi laporan.
                </div>
                <div className="p-3 bg-muted/40 rounded-lg border">
                  <span className="font-bold text-foreground block mb-1 text-emerald-600">Siswa</span>
                  Melihat katalog inventaris lab, mengecek jadwal pemakaian ruangan, serta melaporkan kerusakan alat.
                </div>
                <div className="p-3 bg-muted/40 rounded-lg border">
                  <span className="font-bold text-foreground block mb-1 text-amber-600">Guru</span>
                  Melihat katalog inventaris, mengajukan jadwal penggunaan lab, meminjam barang, dan melaporkan kerusakan alat.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
