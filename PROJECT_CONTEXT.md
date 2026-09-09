# LABMUMA — Project Context & Status

> **Dokumen ini dibuat untuk mempermudah melanjutkan project di PC/device berbeda.**
> Last updated: 2026-08-31

---

## Tentang Project

**LABMUMA** adalah Sistem Informasi Laboratorium RPL untuk **SMK Muhammadiyah Majenang**.
Digunakan oleh staff lab, guru, dan siswa untuk mengelola inventaris komputer, jadwal praktikum, peminjaman alat, dan tiket perbaikan.

- **Lokasi project:** `d:\inventaris lab\labmuma`
- **Branch utama:** `main`

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 16.3.1 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + Lucide Icons |
| ORM | Prisma v7.9.1 (PostgreSQL via `@prisma/adapter-pg`) |
| Database | PostgreSQL via Supabase |
| Auth & Security | NextAuth v5 (beta.32) + Bcrypt Password Hashing + RBAC (`src/lib/rbac.ts`) |
| Validation | Zod (`src/lib/validations.ts`) |
| Token Optimizer | RTK (Rust Token Killer) v0.46.0 |
| Charts & UI | Recharts, Sonner, Neobrutalism Design Theme |
| Export | XLSX (`xlsx`) |

---

## Struktur Database (Prisma Schema)

Schema tersimpan di `prisma/schema.prisma`.

### Auth & Users
- `User` — role: `ADMIN`, `TOOLMAN`, `GURU`, `SISWA` *(Role KEPALA_LAB telah dihapus/digabung ke Staff)*
- Password di-hash menggunakan **Bcrypt** (Salt rounds: 12) via `src/lib/bcrypt.ts`.

### Master Data
- `Location` — Gedung/Lokasi
- `Room` — Ruangan Lab (relasi ke Location)
- `Category` — Kategori barang
- `Brand` — Merk/brand
- `Supplier` — Data supplier

### Inventaris
- `Inventory` — Data barang/inventaris (code unik, condition, status)
- `InventorySpec` — Spesifikasi teknis per barang (key-value)
- `InventoryPhoto` — Foto barang (Supabase Storage)
- `InventoryHistory` — Riwayat perubahan barang

### Transaksi
- `IncomingGoods` + `IncomingGoodsItem` — Barang masuk
- `OutgoingGoods` + `OutgoingGoodsItem` — Barang keluar
- `Borrowing` + `BorrowingItem` — Peminjaman alat

### Maintenance
- `DamageReport` — Laporan kerusakan
- `Repair` + `RepairPart` — Tiket perbaikan teknisi
- `Maintenance` — Pemeliharaan (preventive/corrective)
- `MaintenanceSchedule` — Jadwal pemeliharaan rutin
- `Inspection` + `InspectionItem` — Pemeriksaan rutin

### Teknis RPL
- `PracticumSchedule` — Jadwal praktikum per ruangan (status: `MENUNGGU`, `DISETUJUI`, `DITOLAK`)
- `Software` + `SoftwareInstallation` — Daftar software & instalasi per PC
- `LabAssistant` — Data asisten lab (siswa)

### Pendataan
- `InitialInventory` + `InitialInventoryItem` — Pendataan awal barang
- `AuditLog` — Log aktivitas sistem

---

## Struktur Halaman & Fitur Utama

| Route | Fitur |
|-------|-------|
| `/login` | Login interaktif 3 Mode (GURU via dropdown, SISWA shared, STAFF manual) |
| `/dashboard` | Overview/ringkasan (stats, tiket, jadwal hari ini) |
| `/dashboard/inventaris` | Daftar inventaris (CRUD, filter, status) |
| `/dashboard/kategori` | Kategori barang |
| `/dashboard/ruangan` | Ruangan lab |
| `/dashboard/merk` | Merk/brand |
| `/dashboard/supplier` | Data supplier |
| `/dashboard/users` | Manajemen pengguna & hak akses role |
| `/dashboard/barang-masuk` | Barang masuk |
| `/dashboard/barang-keluar` | Barang keluar |
| `/dashboard/peminjaman` | Peminjaman alat |
| `/dashboard/pendataan-awal` | Pendataan awal inventaris |
| `/dashboard/jadwal` | Jadwal laboratorium (Timeline/Week/Month view + Otorisasi) |
| `/dashboard/pemeriksaan` | Pemeriksaan rutin |
| `/dashboard/software` | Software & lisensi |
| `/dashboard/asisten` | Asisten lab |
| `/dashboard/perbaikan` | Tiket perbaikan teknisi |
| `/dashboard/perbaikan/laporan` | Lapor kerusakan |
| `/dashboard/pemeliharaan` | Pemeliharaan |
| `/dashboard/laporan` | Laporan, rekapitulasi, & export data |
| `/dashboard/pengaturan` | Pengaturan sistem |

---

## Akun Login (Default & Seed)

Semua password di-hash menggunakan **Bcrypt**.

| Role | Email | Password Default | Mode Login |
|------|-------|------------------|------------|
| **ADMIN** | `admin@labmuma.id` / `admin2@labmuma.id` | `admin123` / `admin2024` | Tab **STAFF** |
| **TOOLMAN** | `toolman@labmuma.id` / `toolman2@labmuma.id` | `toolman123` / `toolman2024` | Tab **STAFF** |
| **GURU** | `guru@labmuma.id` / `guru2@labmuma.id` | `guru123` / `guru2024` | Tab **GURU** (Pilih dari dropdown) |
| **SISWA** | `siswa@labmuma.id` / `siswa2@labmuma.id` | `siswa123` / `siswa2024` | Tab **SISWA** |

---

## Setup & Perintah Penting

```bash
# 1. Install dependencies
npm install

# 2. Sinkronisasi DB & Prisma Client
npx prisma db push
npx prisma generate

# 3. Migrasi Password / Seed Data
npm run migrate-passwords   # Mengenkripsi password user lama ke bcrypt
npm run create-users        # Membuat user baru untuk tiap role
# atau
npm run seed                # Seed ulang seluruh master data & sample inventaris

# 4. Jalankan Dev Server
npm run dev
```

---

## Status Fitur Terbaru (Update: 2026-09-09)

1. **Upload Foto Inventaris (Supabase Storage)** ✅
   - Bucket Storage: `lab` (Public Access, RLS policy configured).
   - API Handler: `/api/inventaris/[id]/photos` (Upload & Delete dengan auto audit history).
   - UI Detail Inventaris: Tab Galeri Foto, Modal Upload dengan preset label ("Tampak Depan", "Nomor Seri", dll), Lightbox preview, dan proteksi role (ADMIN/TOOLMAN).
2. **Cetak & Laporan Resmi (PDF/Print)** ✅
   - Kop Surat Kedinasan resmi SMK Muhammadiyah Majenang (PPLG / LABMUMA).
   - Tanda tangan resmi Toolman & Ketua Kompetensi Keahlian.
   - Styling media print (`@media print`) untuk output dokumen kertas A4 rapi tanpa elemen navigasi/sidebar.
   - Export file Excel (`.xlsx`) via `/api/laporan/export`.

---

## Rencana Pengembangan Selanjutnya (Action Plan)

1. **Optimalisasi Data Fetching & Refactoring (Performance)**
   - Pindahkan data fetching dari `useEffect` murni ke **SWR** atau **TanStack Query** untuk caching instan.
   - Pecah komponen besar (`jadwal/page.tsx` & `DashboardClient.tsx`) menjadi modular components (`TimelineView`, `WeekView`, `FilterBar`).

