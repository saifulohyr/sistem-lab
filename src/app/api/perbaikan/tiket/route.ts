import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { requireStaff } from "@/lib/rbac";
import { parseValidation, RepairSchema } from "@/lib/validations";

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
    const authError = requireStaff(session);
    if (authError) return authError;

    const body = await request.json();
    const validation = parseValidation(RepairSchema, {
      ...body,
      technicianId: body.technicianId || session!.id,
    });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const data = validation.data;

    // Check duplicate number
    const existing = await prisma.repair.findUnique({ where: { number: data.number } });
    if (existing) {
      return NextResponse.json({ error: "Nomor tiket sudah digunakan" }, { status: 400 });
    }

    const ticket = await prisma.$transaction(async (tx) => {
      const newRepair = await tx.repair.create({
        data: {
          number: data.number,
          date: new Date(data.date),
          damageReportId: data.damageReportId ?? null,
          inventoryId: data.inventoryId,
          damageType: data.damageType ?? null,
          severity: data.severity ?? null,
          diagnosis: data.diagnosis ?? null,
          status: "DIAGNOSA",
          technicianId: data.technicianId,
        },
      });

      if (data.damageReportId) {
        await tx.damageReport.update({
          where: { id: data.damageReportId },
          data: { status: "DIPROSES" },
        });
      }

      await tx.inventory.update({
        where: { id: data.inventoryId },
        data: { status: "PERBAIKAN" },
      });

      await tx.inventoryHistory.create({
        data: {
          inventoryId: data.inventoryId,
          action: "MULAI_PERBAIKAN",
          description: `Tiket perbaikan dibuat: ${data.number}. Teknisi: ${session!.name}`,
          userId: session!.id,
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
