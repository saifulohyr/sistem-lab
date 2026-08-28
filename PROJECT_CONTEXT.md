# LABMUMA — Project Context & Status

> **Dokumen ini dibuat untuk mempermudah melanjutkan project di PC/device berbeda.**
> Last updated: 2026-08-28

---

## Tentang Project

**LABMUMA** adalah Sistem Informasi Laboratorium RPL untuk **SMK Muhammadiyah Majenang**.
Digunakan oleh staff lab untuk mengelola inventaris komputer, jadwal praktikum, peminjaman alat, dan tiket perbaikan.

- **Lokasi project:** `d:\inventaris lab\labmuma`
- **Branch utama:** `main`

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 16.3.1 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| ORM | Prisma v7.9.1 |
| Database | PostgreSQL via Supabase |
| Auth | NextAuth v5 (beta.32) |
| Icons | Lucide React |
| Charts | Recharts |
| Toast | Sonner |
| Adapter | @auth/prisma-adapter |

---

## Struktur Database (Prisma Schema)

Schema tersimpan di `prisma/schema.prisma`. Berikut daftar model:

### Auth & Users
- `User` — role: ADMIN, TOOLMAN, KEPALA_LAB, GURU

### Master Data
- `Location` — Gedung/Lokasi
- `Room` — Ruangan Lab (relasinya ke Location)
- `Category` — Kategori barang
- `Brand` — Merk/brand
- `Supplier` — Data supplier

### Inventaris
- `Inventory` — Data barang/inventaris (code unik, condition, status)
- `InventorySpec` — Spesifikasi teknis per barang (key-value)
- `InventoryPhoto` — Foto barang
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
- `PracticumSchedule` — Jadwal praktikum per ruangan
- `Software` + `SoftwareInstallation` — Daftar software & instalasi per PC
- `LabAssistant` — Data asisten lab (siswa)

### Pendataan
- `InitialInventory` + `InitialInventoryItem` — Pendataan awal barang
- `AuditLog` — Log aktivitas sistem

---

## Struktur Halaman (`src/app/dashboard/`)

| Route | Fitur |
|-------|-------|
| `/dashboard` | Overview/ringkasan (stats, tiket, jadwal hari ini) |
| `/dashboard/inventaris` | Daftar inventaris (CRUD) |
| `/dashboard/kategori` | Kategori barang |
| `/dashboard/ruangan` | Ruangan lab |
| `/dashboard/merk` | Merk/brand |
| `/dashboard/supplier` | Data supplier |
| `/dashboard/users` | Manajemen pengguna |
| `/dashboard/barang-masuk` | Barang masuk |
| `/dashboard/barang-keluar` | Barang keluar |
| `/dashboard/peminjaman` | Peminjaman alat |
| `/dashboard/pendataan-awal` | Pendataan awal inventaris |
| `/dashboard/jadwal` | Jadwal laboratorium (timeline/week/month view) |
| `/dashboard/pemeriksaan` | Pemeriksaan rutin |
| `/dashboard/software` | Software & lisensi |
| `/dashboard/asisten` | Asisten lab |
| `/dashboard/perbaikan` | Tiket perbaikan teknisi |
| `/dashboard/perbaikan/laporan` | Lapor kerusakan |
| `/dashboard/pemeliharaan` | Pemeliharaan |
| `/dashboard/laporan` | Laporan & rekapitulasi |
| `/dashboard/pengaturan` | Pengaturan sistem |

---

## Akun Default (Seed Data)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@labmuma.id` | `admin123` |
| Toolman | `toolman@labmuma.id` | `toolman123` |
| Kepala Lab | `kepalalab@labmuma.id` | `kepalalab123` |
| Guru | `guru@labmuma.id` | `guru123` |

---

## Setup di PC Baru

```bash
# 1. Clone repo
git clone <repo-url> .

# 2. Install dependencies
npm install

# 3. Buat .env dari template
cp .env.example .env
# Isi DATABASE_URL, DIRECT_URL (Supabase), AUTH_SECRET, NEXTAUTH_URL

# 4. Generate Prisma client
npx prisma generate

# 5. Push schema ke database (jika DB sudah ada di Supabase, skip)
npx prisma db push

# 6. Seed data awal (jika DB kosong)
npm run seed

# 7. Jalankan dev server
npm run dev
```

---

## Konfigurasi `.env`

```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
AUTH_SECRET="labmuma-secret-key-change-in-production-2026"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
```

PENTING: File `.env` tidak di-push ke GitHub. Simpan kredensial Supabase kamu sendiri.

---

## Design System

**Warna Utama:**
- Primary Blue: `#0058be` / `#2170e4`
- Dark Text: `#131b2e`
- Muted Text: `#505f76`
- Background accent: `#f2f3ff`
- Border: `#eaedff`

**Lab Color Themes (untuk Jadwal):**
- Lab RPL 1 → Biru (`#0058be`)
- Lab RPL 2 → Slate terang
- Lab RPL 3 → Slate gelap/dark
- Lab RPL 4 → Amber

---

## Git History Singkat

```
3241259 fix(jadwal): sanitize request body & fix PracticumSchedule DB insertion
29420be docs: simplify README.md
3b628b6 chore: remove unused QR code generator feature
3f0a2a0 feat: complete LABMUMA lab management system with Stitch UI, multi-lab scheduling, and imported inventory dataset
f82c69b feat: initial setup LABMUMA core foundation (Phase 1)
```

---

## Status Terakhir (2026-08-28)

- [x] Semua halaman dashboard sudah ada dan berfungsi
- [x] Jadwal laboratorium: Timeline / Week / Month view -- sudah fix (bug body sanitization di API sudah diperbaiki)
- [x] Database di Supabase (PostgreSQL) sudah terisi data awal
- [x] Autentikasi NextAuth v5 sudah berjalan
- [ ] Halaman laporan rekapitulasi -- kemungkinan masih perlu pengembangan lebih lanjut
- [ ] Fitur export ke Excel/PDF -- library `xlsx` sudah terinstall, implementasi belum final
- [ ] Pemeriksaan rutin (`/pemeriksaan`) -- perlu dicek apakah sudah lengkap
- [ ] Upload foto barang -- Supabase storage sudah terkonfigurasi tapi implementasi upload belum selesai

---

## Catatan Developer

- Prisma Client di-generate ke `src/generated/prisma` (bukan default `node_modules`)
- Auth menggunakan **NextAuth v5 beta** -- API-nya berbeda dari v4 (session di server component pakai `auth()`, bukan `getServerSession()`)
- Jadwal praktikum: `dayOfWeek` menggunakan format **1=Senin s.d. 7=Minggu** (bukan format JS 0=Minggu)
- Room theme di halaman jadwal di-mapping berdasarkan `room.id` (contoh: `lab-rpl-1`, `lab-rpl-2`, dst.)
- Script seed: `npm run seed` -- menjalankan `tsx prisma/seed.ts`
- Sidebar menu punya 5 grup: (tanpa label), MASTER DATA, TRANSACTIONS, OPERATIONS, MAINTENANCE
