import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

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
    if (!session || (session.role !== "ADMIN" && session.role !== "TOOLMAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { number, date, type, title, description, result } = await request.json();

    if (!number || !title || !description) {
      return NextResponse.json({ error: "Nomor, judul, dan deskripsi wajib diisi" }, { status: 400 });
    }

    const existing = await prisma.maintenance.findUnique({ where: { number } });
    if (existing) {
      return NextResponse.json({ error: "Nomor dokumen sudah digunakan" }, { status: 400 });
    }

    const maintenance = await prisma.maintenance.create({
      data: {
        number,
        date: date ? new Date(date) : new Date(),
        type: type || "PREVENTIVE",
        title,
        description,
        result: result || null,
        technicianId: session.id,
      },
    });

    return NextResponse.json({ success: true, data: maintenance });
  } catch (error) {
    console.error("Error creating maintenance:", error);
    return NextResponse.json({ error: "Gagal mencatat pemeliharaan" }, { status: 500 });
  }
}
