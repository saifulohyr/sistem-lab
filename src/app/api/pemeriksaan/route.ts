import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { generateCode } from "@/lib/utils";

export async function GET() {
  try {
    const inspections = await prisma.inspection.findMany({
      include: {
        room: { select: { name: true } },
        inspector: { select: { name: true } },
        _count: { select: { items: true } }
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ data: inspections });
  } catch (error) {
    console.error("Error fetching inspections:", error);
    return NextResponse.json({ error: "Gagal mengambil data pemeriksaan" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { date, roomId, note } = await request.json();

    if (!roomId) {
      return NextResponse.json({ error: "Ruangan wajib dipilih" }, { status: 400 });
    }

    const number = generateCode("CHK", Math.floor(Math.random() * 10000));

    // Get all inventories for this room to create checklist items
    const inventories = await prisma.inventory.findMany({
      where: { roomId, status: "AKTIF" }
    });

    const inspection = await prisma.$transaction(async (tx: any) => {
      const newInspection = await tx.inspection.create({
        data: {
          number,
          date: date ? new Date(date) : new Date(),
          roomId,
          inspectorId: session.id,
          note: note || null,
        },
      });

      // Create checklist items for all active items in the room
      if (inventories.length > 0) {
        await tx.inspectionItem.createMany({
          data: inventories.map(inv => ({
            inspectionId: newInspection.id,
            inventoryId: inv.id,
            status: "ADA_BAIK", // default
          }))
        });
      }

      return newInspection;
    });

    return NextResponse.json({ success: true, data: inspection });
  } catch (error) {
    console.error("Error creating inspection:", error);
    return NextResponse.json({ error: "Gagal membuat sesi pemeriksaan" }, { status: 500 });
  }
}
