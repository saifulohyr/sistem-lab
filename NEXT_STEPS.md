# 🚀 Checklist Deployment & Rencana Pengembangan Selanjutnya (AI Context)

File ini ditujukan sebagai panduan bagi _Developer_ dan konteks lanjutan bagi AI saat _repository_ ini di-_pull_ di PC Sekolah.

---

## 🛠️ 1. Checklist Pemindahan ke PC Sekolah
Saat pertama kali melakukan `git pull` di PC Sekolah, lakukan urutan berikut agar aplikasi tidak mengalami *crash* atau *error login*:

1. **Persiapan Environment (`.env`)**
   - Pastikan URL database Supabase / PostgreSQL sudah ada di `DATABASE_URL`.
   - Pastikan `NEXTAUTH_SECRET` sudah terisi.
2. **Install Dependencies & Sinkronisasi Database**
   ```bash
   npm install
   npx prisma db push
   npx prisma generate
   ```
   *(Penting: Skema database telah berubah. Role `KEPALA_LAB` telah dihapus dan fitur otorisasi jadwal menggunakan status telah ditambahkan).*
3. **Migrasi Enkripsi Password (SANGAT PENTING)**
   - Sistem login terbaru menggunakan **bcrypt**. Akun lama dengan teks biasa (plain-text) tidak akan bisa login.
   - **Tindakan:** Jalankan script migrasi atau jalankan ulang _seeder_ jika database masih berstatus uji coba:
     ```bash
     npm run migrate-passwords
     # atau
     npx prisma db seed
     ```
4. **Jalankan Aplikasi**
   - `npm run dev`

---

## 💡 2. Konsep UI Login Terbaru (Referensi AI)
- **Tombol Kredensial Cepat telah Dihapus** demi keamanan (mencegah siswa usil).
- **Tab GURU:** Menggunakan sistem *Dropdown* nama dari database agar guru tidak perlu mengetik email manual.
- **Tab SISWA:** Email di- *hardcode* secara internal ke `siswa@labmuma.id`. Siswa hanya perlu memasukkan kata sandi (Satu akun bersama untuk seluruh siswa agar tidak memberatkan sistem).
- **Tab STAFF:** Admin & Toolman menggunakan input manual email & password (seperti login tradisional).

---

## 🎯 3. Next Action Plan (Fase Jangka Menengah - Optimalisasi & Fitur Baru)
*(Untuk AI: Saat menerima prompt "Lanjutkan pekerjaan", prioritaskan urutan di bawah ini!)*

### A. Optimalisasi Data Fetching & Refactoring (Performance)
Saat ini, halaman utama seperti `jadwal/page.tsx` (42 KB) menggunakan `useEffect` murni yang memicu *re-render* dan *loading indicator* di setiap klik halaman.
- **Tugas 1:** Pindahkan *Data Fetching* dari `useEffect` standar menuju pustaka *caching* **SWR** atau **React Query (TanStack)** untuk UX instan (tanpa loading saat kembali ke halaman).
- **Tugas 2:** Pecah komponen *monolith* `jadwal/page.tsx` dan `DashboardClient.tsx` menjadi komponen-komponen yang lebih kecil (contoh: `TimelineView`, `WeekView`, `FilterBar`, dll) dengan kaidah *React Best Practices*.
- **Tugas 3:** Implementasikan `loading.tsx` global di Next.js App Router dan `error.tsx` untuk menahan state transisi dengan elegan.

### B. Penyelesaian Fitur Inti
- **Selesaikan Upload Foto:** Supabase Storage sudah dikonfigurasi pada tahap sebelumnya, tinggal menyambungkan UI dengan API-nya.
- **Fitur Laporan & Cetak:** Implementasikan *export* jadwal dan inventaris ke Excel / PDF (gunakan pustaka `xlsx` atau `jsPDF`).
