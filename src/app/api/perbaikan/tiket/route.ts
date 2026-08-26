import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const repairs = await prisma.repair.findMany({
      include: {
        inventory: { select: { name: true, code: true } },
        technician: { select: { name: true } },
        damageReport: { select: { number: true, reporter: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: repairs });
  } catch (error) {
    console.error("Error fetching repair tickets:", error);
    return NextResponse.json({ error: "Gagal mengambil data tiket perbaikan" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "TOOLMAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { number, date, damageReportId, inventoryId, damageType, severity, diagnosis } = await request.json();

    if (!number || !inventoryId) {
      return NextResponse.json({ error: "Nomor tiket dan ID Barang wajib diisi" }, { status: 400 });
    }

    // Check duplicate number
    const existing = await prisma.repair.findUnique({ where: { number } });
    if (existing) {
      return NextResponse.json({ error: "Nomor tiket sudah digunakan" }, { status: 400 });
    }

    const ticket = await prisma.$transaction(async (tx: any) => {
      // 1. Create Repair Ticket
      const newRepair = await tx.repair.create({
        data: {
          number,
          date: date ? new Date(date) : new Date(),
          damageReportId: damageReportId || null,
          inventoryId,
          damageType: damageType || null,
          severity: severity || null,
          diagnosis: diagnosis || null,
          status: "DIAGNOSA",
          technicianId: session.id,
        },
      });

      // 2. Update Damage Report Status (if linked)
      if (damageReportId) {
        await tx.damageReport.update({
          where: { id: damageReportId },
          data: { status: "DIPROSES" },
        });
      }

      // 3. Ensure Inventory status is PERBAIKAN
      await tx.inventory.update({
        where: { id: inventoryId },
        data: { status: "PERBAIKAN" },
      });

      // 4. Log History
      await tx.inventoryHistory.create({
        data: {
          inventoryId,
          action: "MULAI_PERBAIKAN",
          description: `Tiket perbaikan dibuat: ${number}. Teknisi: ${session.name}`,
          userId: session.id,
        },
      });

      return newRepair;
    });

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error("Error creating repair ticket:", error);
    return NextResponse.json({ error: "Gagal membuat tiket perbaikan" }, { status: 500 });
  }
}
