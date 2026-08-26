import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const repair = await prisma.repair.findUnique({
      where: { id },
      include: {
        inventory: { select: { name: true, code: true, condition: true, status: true } },
        technician: { select: { name: true } },
        damageReport: { select: { number: true, issue: true, reporter: true } },
        parts: true,
      },
    });

    if (!repair) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: repair });
  } catch (error) {
    console.error("Error fetching repair ticket detail:", error);
    return NextResponse.json({ error: "Gagal mengambil detail tiket" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "TOOLMAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const { status, action, result, cost, finalCondition } = await request.json();

    const updated = await prisma.$transaction(async (tx: any) => {
      const existing = await tx.repair.findUnique({ where: { id } });
      if (!existing) throw new Error("Tiket tidak ditemukan");

      const isCompleted = status === "SELESAI";
      
      const repair = await tx.repair.update({
        where: { id },
        data: {
          status,
          action: action !== undefined ? action : existing.action,
          result: result !== undefined ? result : existing.result,
          cost: cost !== undefined ? parseFloat(cost) : existing.cost,
          completedAt: isCompleted ? new Date() : null,
        },
      });

      // If completed, update inventory condition and status, and damage report
      if (isCompleted) {
        if (existing.damageReportId) {
          await tx.damageReport.update({
            where: { id: existing.damageReportId },
            data: { status: "SELESAI" },
          });
        }

        await tx.inventory.update({
          where: { id: existing.inventoryId },
          data: { 
            status: "AKTIF", // back to active
            condition: finalCondition || "BAIK" 
          },
        });

        await tx.inventoryHistory.create({
          data: {
            inventoryId: existing.inventoryId,
            action: "SELESAI_PERBAIKAN",
            description: `Perbaikan selesai. Hasil: ${result || '-'}. Kondisi akhir: ${finalCondition || 'BAIK'}`,
            userId: session.id,
          },
        });
      }

      return repair;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error updating repair ticket:", error);
    return NextResponse.json({ error: error.message || "Gagal memperbarui tiket" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.$transaction(async (tx: any) => {
      const repair = await tx.repair.findUnique({
        where: { id },
      });

      if (!repair) throw new Error("Not found");
      
      if (repair.damageReportId) {
        await tx.damageReport.update({
          where: { id: repair.damageReportId },
          data: { status: "MENUNGGU" }, // rollback report status
        });
      }

      // Rollback inventory status to AKTIF if we delete a repair that is ongoing
      if (repair.status !== "SELESAI") {
        await tx.inventory.update({
          where: { id: repair.inventoryId },
          data: { status: "AKTIF" },
        });
      }

      await tx.repair.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting repair ticket:", error);
    return NextResponse.json({ error: "Gagal menghapus tiket" }, { status: 500 });
  }
}
