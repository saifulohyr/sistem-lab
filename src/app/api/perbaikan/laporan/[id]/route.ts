import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = await prisma.damageReport.findUnique({
      where: { id },
      include: {
        inventory: { include: { category: true, room: true } },
        user: { select: { name: true } },
        repairs: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: report });
  } catch (error) {
    console.error("Error fetching damage report detail:", error);
    return NextResponse.json({ error: "Gagal mengambil detail laporan" }, { status: 500 });
  }
}

// PATCH /api/perbaikan/laporan/[id] - Update status (e.g. DITOLAK)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, note } = await request.json();

    const result = await prisma.$transaction(async (tx: any) => {
      const report = await tx.damageReport.findUnique({ where: { id } });
      if (!report) throw new Error("Not found");

      const updated = await tx.damageReport.update({
        where: { id },
        data: { status },
      });

      // If rejected, return inventory back to AKTIF
      if (status === "DITOLAK") {
        await tx.inventory.update({
          where: { id: report.inventoryId },
          data: { status: "AKTIF" },
        });
      }

      return updated;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error updating damage report:", error);
    return NextResponse.json({ error: "Gagal memperbarui status laporan" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.$transaction(async (tx: any) => {
      const report = await tx.damageReport.findUnique({
        where: { id },
      });

      if (!report) throw new Error("Not found");
      
      // Rollback inventory status if it's still MENUNGGU and no repair ticket yet
      if (report.status === "MENUNGGU") {
        await tx.inventory.update({
          where: { id: report.inventoryId },
          data: { status: "AKTIF" }, // Revert status
        });
      }

      await tx.damageReport.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting damage report:", error);
    return NextResponse.json({ error: "Gagal menghapus laporan" }, { status: 500 });
  }
}
