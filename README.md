# LABMUMA — Sistem Informasi Manajemen Laboratorium RPL Terpadu

Sistem manajemen laboratorium sekolah (SMK Muhammadiyah Majenang) modern untuk pendataan inventaris aset, penandaan QR Code, sirkulasi peminjaman, tiket servis & perbaikan teknisi, jadwal praktikum, hingga rekapitulasi laporan resmi.

---

## 🚀 Fitur Utama

- **📦 Manajemen Inventaris & Spesifikasi**: Pendataan aset detail hingga level hardware (RAM, SSD, Processor, OS, Motherboard, BIOS, Posisi Rak/Meja, Kondisi).
- **🏷️ Multi-Label QR Code Generator**: Cetak puluhan label stiker QR code siap potong untuk penandaan fisik aset lab.
- **🔄 Sirkulasi & Peminjaman Barang**: Manajemen peminjaman alat lab oleh guru/siswa lengkap dengan deteksi tenggat waktu & pengembalian.
- **🛠️ Kanban Servis & Perbaikan**: Manajemen laporan kerusakan dan tiket teknisi (Diagnosa, Proses, Testing, Selesai).
- **📅 Jadwal Praktikum Multi-Lab**: Jadwal penggunaan Lab RPL 1, Lab RPL 2, Lab RPL 3, dan Lab RPL 4 dengan tampilan kalender visual & timeline.
- **📑 Laporan & Rekapitulasi**: Cetak Berita Acara resmi PDF dengan kop surat sekolah dan export data Excel/CSV.
- **🔐 Hak Akses Berlapis (RBAC)**: 4 Role pengguna (Administrator, Toolman/Teknisi, Kepala Laboratorium, Guru/Siswa).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Stitch Design System
- **Database & ORM**: PostgreSQL / Supabase + Prisma ORM
- **Auth**: NextAuth.js (Auth.js)
- **Icons & UI**: Lucide React + Sonner

---

## ⚡ Memulai Project

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/saifulohyr/sistem-lab.git
cd sistem-lab
npm install
```

### 2. Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env` dan sesuaikan koneksi database PostgreSQL Anda:
```bash
cp .env.example .env
```

### 3. Setup Database & Prisma
```bash
npx prisma generate
npx prisma db push
npm run seed
```

### 4. Jalankan Server Development
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 👥 Akun Default (Seeding)

| Role | Email | Password |
|------|-------|----------|
| **Administrator** | `admin@labmuma.id` | `admin123` |
| **Toolman (Teknisi)** | `toolman@labmuma.id` | `toolman123` |
| **Kepala Lab** | `kepalalab@labmuma.id` | `kepalalab123` |
| **Guru** | `guru@labmuma.id` | `guru123` |
