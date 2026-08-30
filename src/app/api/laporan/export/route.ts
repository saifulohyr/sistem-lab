import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { requireAuth } from "@/lib/rbac";
import * as XLSX from "xlsx";

// Re-use the same report query logic, but return an Excel file
export async function GET(request: Request) {
  try {
    const session = await getSession();
    const authError = requireAuth(session);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");

    // Only handle Excel export at this endpoint
    if (format !== "xlsx") {
      return NextResponse.json({ error: "Format tidak didukung" }, { status: 400 });
    }

    const type = searchParams.get("type") || "INVENTARIS";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const roomId = searchParams.get("roomId") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const condition = searchParams.get("condition") || undefined;

    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }

    let sheetData: Record<string, unknown>[] = [];
    let sheetName = "Laporan";

    if (type === "INVENTARIS") {
      sheetName = "Inventaris";
      const where: Record<string, unknown> = {};
      if (roomId) where.roomId = roomId;
      if (categoryId) where.categoryId = categoryId;
      if (condition) where.condition = condition;

      const items = await prisma.inventory.findMany({
        where,
        include: {
          category: { select: { name: true } },
          brand: { select: { name: true } },
          room: { select: { name: true } },
        },
        orderBy: { code: "asc" },
      });

      sheetData = items.map((it, idx) => ({
        "No": idx + 1,
        "Kode Barang": it.code,
        "Nama Barang": it.name,
        "Kategori": it.category?.name ?? "-",
        "Merk": it.brand?.name ?? "-",
        "Tipe": it.type ?? "-",
        "Ruangan": it.room?.name ?? "-",
        "Posisi": it.position ?? "-",
        "Kondisi": it.condition,
        "Status": it.status,
        "Jumlah": it.quantity,
        "Harga Satuan": it.price ?? 0,
        "Tahun": it.year ?? "-",
      }));

    } else if (type === "PEMINJAMAN") {
      sheetName = "Peminjaman";
      const records = await prisma.borrowing.findMany({
        where: startDate || endDate ? { date: dateFilter } : {},
        include: {
          user: { select: { name: true } },
          items: { include: { inventory: { select: { code: true, name: true } } } },
        },
        orderBy: { date: "desc" },
      });
      sheetData = records.map((rec, idx) => ({
        "No": idx + 1,
        "No Transaksi": rec.number,
        "Tanggal": new Date(rec.date).toLocaleDateString("id-ID"),
        "Peminjam": rec.borrower,
        "Peran": rec.role ?? "-",
        "Keperluan": rec.purpose,
        "Batas Kembali": rec.expectedReturn ? new Date(rec.expectedReturn).toLocaleDateString("id-ID") : "-",
        "Dikembalikan": rec.actualReturn ? new Date(rec.actualReturn).toLocaleDateString("id-ID") : "-",
        "Status": rec.status,
        "Daftar Barang": rec.items.map(i => `${i.inventory.name} (${i.quantity}x)`).join(", "),
        "Petugas": rec.user.name,
      }));

    } else if (type === "PERBAIKAN") {
      sheetName = "Perbaikan";
      const records = await prisma.repair.findMany({
        where: startDate || endDate ? { date: dateFilter } : {},
        include: {
          inventory: { select: { code: true, name: true } },
          technician: { select: { name: true } },
        },
        orderBy: { date: "desc" },
      });
      sheetData = records.map((rec, idx) => ({
        "No": idx + 1,
        "No Tiket": rec.number,
        "Tanggal": new Date(rec.date).toLocaleDateString("id-ID"),
        "Kode Barang": rec.inventory.code,
        "Nama Barang": rec.inventory.name,
        "Jenis": rec.damageType ?? "-",
        "Tingkat": rec.severity ?? "-",
        "Diagnosa": rec.diagnosis ?? "-",
        "Tindakan": rec.action ?? "-",
        "Hasil": rec.result ?? "-",
        "Status": rec.status,
        "Biaya": rec.cost ?? 0,
        "Teknisi": rec.technician.name,
      }));

    } else if (type === "PEMELIHARAAN") {
      sheetName = "Pemeliharaan";
      const records = await prisma.maintenance.findMany({
        where: startDate || endDate ? { date: dateFilter } : {},
        include: { technician: { select: { name: true } } },
        orderBy: { date: "desc" },
      });
      sheetData = records.map((rec, idx) => ({
        "No": idx + 1,
        "No Catatan": rec.number,
        "Tanggal": new Date(rec.date).toLocaleDateString("id-ID"),
        "Tipe": rec.type,
        "Judul Kegiatan": rec.title,
        "Deskripsi": rec.description,
        "Hasil": rec.result ?? "-",
        "Teknisi": rec.technician.name,
      }));
    }

    // Build Excel workbook
    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Auto-width columns
    const colWidths = Object.keys(sheetData[0] ?? {}).map((key) => ({
      wch: Math.max(key.length + 2, 15),
    }));
    ws["!cols"] = colWidths;

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

    const filename = `Laporan_${type}_${new Date().toISOString().split("T")[0]}.xlsx`;

    return new Response(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting Excel:", error);
    return NextResponse.json({ error: "Gagal mengekspor data ke Excel" }, { status: 500 });
  }
}
