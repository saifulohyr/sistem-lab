import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { requireStaff } from "@/lib/rbac";
import { parseValidation, MaintenanceSchema } from "@/lib/validations";

export async function GET() {
  try {
    const records = await prisma.maintenance.findMany({
      include: {
        technician: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ data: records });
  } catch (error) {
    console.error("Error fetching maintenance:", error);
    return NextResponse.json({ error: "Gagal mengambil data pemeliharaan" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const authError = requireStaff(session);
    if (authError) return authError;

    const body = await request.json();
    const validation = parseValidation(MaintenanceSchema, {
      ...body,
      technicianId: body.technicianId || session!.id,
    });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const data = validation.data;

    const existing = await prisma.maintenance.findUnique({ where: { number: data.number } });
    if (existing) {
      return NextResponse.json({ error: "Nomor dokumen sudah digunakan" }, { status: 400 });
    }

    const maintenance = await prisma.maintenance.create({
      data: {
        number: data.number,
        date: new Date(data.date),
        type: data.type,
        title: data.title,
        description: data.description,
        result: data.result ?? null,
        technicianId: data.technicianId,
      },
    });

    return NextResponse.json({ success: true, data: maintenance });
  } catch (error) {
    console.error("Error creating maintenance:", error);
    return NextResponse.json({ error: "Gagal mencatat pemeliharaan" }, { status: 500 });
  }
}
