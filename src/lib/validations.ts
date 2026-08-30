import { z } from "zod";

// ─── Common helpers ───────────────────────────────────────────
const optionalString = z.string().trim().optional().nullable();
const requiredString = (field: string) =>
  z.string().trim().min(1, `${field} tidak boleh kosong`);

// ─── Auth ─────────────────────────────────────────────────────
export const LoginSchema = z.object({
  email: z.email({ error: "Format email tidak valid" }),
  password: z.string().min(1, "Password wajib diisi"),
});

// ─── User ─────────────────────────────────────────────────────
export const CreateUserSchema = z.object({
  name: requiredString("Nama"),
  email: z.email({ error: "Format email tidak valid" }),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["ADMIN", "TOOLMAN", "GURU", "SISWA"], {
    error: "Role tidak valid",
  }).optional().default("SISWA"),
});

export const UpdateUserSchema = z.object({
  name: requiredString("Nama").optional(),
  email: z.email({ error: "Format email tidak valid" }).optional(),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
  role: z.enum(["ADMIN", "TOOLMAN", "GURU", "SISWA"]).optional(),
  active: z.boolean().optional(),
});

// ─── Inventory ────────────────────────────────────────────────
export const CreateInventorySchema = z.object({
  code: requiredString("Kode barang"),
  name: requiredString("Nama barang"),
  categoryId: requiredString("Kategori"),
  brandId: optionalString,
  type: optionalString,
  serialNumber: optionalString,
  year: z.number().int().min(1990).max(2099).optional().nullable(),
  source: optionalString,
  price: z.number().min(0).optional().nullable(),
  documentNo: optionalString,
  roomId: optionalString,
  position: optionalString,
  condition: z.enum(["BAIK", "RUSAK_RINGAN", "RUSAK_BERAT", "TIDAK_DITEMUKAN"]).default("BAIK"),
  status: z.enum(["AKTIF", "PERBAIKAN", "DIPINJAM", "NONAKTIF", "DIHAPUS"]).default("AKTIF"),
  quantity: z.number().int().min(1).default(1),
  note: optionalString,
  specs: z.array(z.object({
    key: z.string().min(1),
    value: z.string().min(1),
  })).optional().default([]),
});

export const UpdateInventorySchema = CreateInventorySchema.partial().omit({ code: true });

// ─── Category ─────────────────────────────────────────────────
export const CategorySchema = z.object({
  name: requiredString("Nama kategori"),
  description: optionalString,
  icon: optionalString,
});

// ─── Brand ────────────────────────────────────────────────────
export const BrandSchema = z.object({
  name: requiredString("Nama merk"),
});

// ─── Supplier ─────────────────────────────────────────────────
export const SupplierSchema = z.object({
  name: requiredString("Nama supplier"),
  contactName: optionalString,
  phone: optionalString,
  email: z.email({ error: "Format email tidak valid" }).optional().nullable(),
  address: optionalString,
});

// ─── Room ─────────────────────────────────────────────────────
export const RoomSchema = z.object({
  name: requiredString("Nama ruangan"),
  locationId: requiredString("Lokasi"),
  capacity: z.number().int().min(1).optional().nullable(),
  note: optionalString,
});

// ─── Incoming Goods ───────────────────────────────────────────
export const IncomingGoodsSchema = z.object({
  number: requiredString("Nomor dokumen"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  supplierId: optionalString,
  source: optionalString,
  documentNo: optionalString,
  note: optionalString,
  items: z.array(z.object({
    inventoryId: requiredString("Barang"),
    quantity: z.number().int().min(1, "Jumlah minimal 1"),
    price: z.number().min(0).optional().nullable(),
    note: optionalString,
  })).min(1, "Minimal 1 barang harus ditambahkan"),
});

// ─── Outgoing Goods ───────────────────────────────────────────
export const OutgoingGoodsSchema = z.object({
  number: requiredString("Nomor dokumen"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  type: requiredString("Jenis pengeluaran"),
  destination: optionalString,
  note: optionalString,
  items: z.array(z.object({
    inventoryId: requiredString("Barang"),
    quantity: z.number().int().min(1, "Jumlah minimal 1"),
    reason: optionalString,
    note: optionalString,
  })).min(1, "Minimal 1 barang harus ditambahkan"),
});

// ─── Borrowing ────────────────────────────────────────────────
export const BorrowingSchema = z.object({
  number: requiredString("Nomor peminjaman"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  borrower: requiredString("Nama peminjam"),
  role: optionalString,
  purpose: requiredString("Keperluan"),
  expectedReturn: z.string().optional().nullable(),
  note: optionalString,
  items: z.array(z.object({
    inventoryId: requiredString("Barang"),
    quantity: z.number().int().min(1, "Jumlah minimal 1"),
    note: optionalString,
  })).min(1, "Minimal 1 barang harus dipilih"),
});

// ─── Repair (Perbaikan) ───────────────────────────────────────
export const RepairSchema = z.object({
  number: requiredString("Nomor tiket"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  damageReportId: optionalString,
  inventoryId: requiredString("Barang"),
  diagnosis: optionalString,
  damageType: z.enum(["SOFTWARE", "HARDWARE", "JARINGAN"]).optional().nullable(),
  severity: z.enum(["RINGAN", "SEDANG", "BERAT"]).optional().nullable(),
  action: optionalString,
  result: optionalString,
  status: z.enum(["DIAGNOSA", "PROSES", "TESTING", "SELESAI"]).default("DIAGNOSA"),
  technicianId: requiredString("Teknisi"),
  cost: z.number().min(0).optional().nullable(),
});

// ─── Maintenance (Pemeliharaan) ───────────────────────────────
export const MaintenanceSchema = z.object({
  number: requiredString("Nomor pemeliharaan"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  type: z.enum(["PREVENTIVE", "CORRECTIVE"], { error: "Tipe tidak valid" }),
  title: requiredString("Judul kegiatan"),
  description: requiredString("Deskripsi"),
  result: optionalString,
  technicianId: requiredString("Teknisi"),
});

// ─── Jadwal Praktikum ─────────────────────────────────────────
export const JadwalSchema = z.object({
  roomId: requiredString("Ruangan"),
  subject: requiredString("Mata pelajaran"),
  teacher: requiredString("Nama guru"),
  className: requiredString("Kelas"),
  dayOfWeek: z.number().int().min(1).max(7),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu harus HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu harus HH:MM"),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/, "Format tahun ajaran harus YYYY/YYYY"),
  semester: z.enum(["GANJIL", "GENAP"], { error: "Semester tidak valid" }),
});

// ─── Helper: parse and return validation error ────────────────
export function parseValidation<T>(schema: z.ZodSchema<T>, data: unknown):
  | { success: true; data: T }
  | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errors };
  }
  return { success: true, data: result.data };
}
