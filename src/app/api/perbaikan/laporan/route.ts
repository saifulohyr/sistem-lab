import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const reports = await prisma.damageReport.findMany({
      include: {
        inventory: { select: { name: true, code: true, category: { select: { name: true } } } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: reports });
  } catch (error) {
    console.error("Error fetching damage reports:", error);
    return NextResponse.json({ error: "Gagal mengambil data laporan kerusakan" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { number, date, reporter, inventoryId, issue, photoUrl } = await request.json();

    if (!number || !reporter || !inventoryId || !issue) {
      return NextResponse.json({ error: "Data wajib belum lengkap" }, { status: 400 });
    }

    // Check duplicate number
    const existing = await prisma.damageReport.findUnique({ where: { number } });
    if (existing) {
      return NextResponse.json({ error: "Nomor laporan sudah digunakan" }, { status: 400 });
    }

    const report = await prisma.$transaction(async (tx: any) => {
      // Create damage report
      const newReport = await tx.damageReport.create({
        data: {
          number,
          date: date ? new Date(date) : new Date(),
          reporter,
          inventoryId,
          issue,
          photoUrl: photoUrl || null,
          status: "MENUNGGU",
          userId: session.id, // Penerima laporan
        },
      });

      // Update inventory status to PERBAIKAN
      await tx.inventory.update({
        where: { id: inventoryId },
        data: { status: "PERBAIKAN" },
      });

      // Add to inventory history
      await tx.inventoryHistory.create({
        data: {
          inventoryId,
          action: "LAPOR_RUSAK",
          description: `Dilaporkan rusak oleh ${reporter}. Keluhan: ${issue}`,
          userId: session.id,
        },
      });

      return newReport;
    });

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error("Error creating damage report:", error);
    return NextResponse.json({ error: "Gagal membuat laporan kerusakan" }, { status: 500 });
  }
}
