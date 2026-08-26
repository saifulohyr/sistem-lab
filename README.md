# Sistem Informasi Laboratorium RPL (LABMUMA)

Aplikasi web manajemen laboratorium RPL SMK Muhammadiyah Majenang. Digunakan untuk pendataan inventaris PC & komponen, jadwal praktikum, peminjaman alat, serta tiket perbaikan teknisi.

## Fitur
- Data inventaris & spesifikasi PC (Lab 1 - 4)
- Jadwal penggunaan lab praktikum
- Peminjaman dan pengembalian alat
- Laporan kerusakan & tiket perbaikan teknisi
- Rekapitulasi laporan

## Tech Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL
- NextAuth

## Cara Menjalankan

1. Install dependencies:
```bash
npm install
```

2. Konfigurasi `.env`:
```bash
cp .env.example .env
```

3. Setup database & seed data:
```bash
npx prisma db push
npm run seed
```

4. Jalankan aplikasi:
```bash
npm run dev
```

## Akun Login (Default)
- **Admin**: `admin@labmuma.id` / `admin123`
- **Toolman**: `toolman@labmuma.id` / `toolman123`
- **Kepala Lab**: `kepalalab@labmuma.id` / `kepalalab123`
- **Guru**: `guru@labmuma.id` / `guru123`
