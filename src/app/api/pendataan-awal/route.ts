import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const list = await prisma.initialInventory.findMany({
      include: {
        user: { select: { name: true, role: true } },
        room: true,
        _count: { select: { items: true } },
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ data: list });
  } catch (error) {
    console.error("Error fetching initial inventory list:", error);
    return NextResponse.json({ error: "Gagal mengambil data pendataan awal" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { number, date, roomId, note, items = [] } = await request.json();

    if (!number || !roomId) {
      return NextResponse.json({ error: "Nomor pendataan dan ruangan wajib diisi" }, { status: 400 });
    }

    const initial = await prisma.initialInventory.create({
      data: {
        number,
        date: date ? new Date(date) : new Date(),
        userId: session.id,
        roomId,
        note: note || null,
        status: "DRAFT",
        items: {
          create: items.map((item: any) => ({
            code: item.code,
            name: item.name,
            category: item.category || null,
            brand: item.brand || null,
            type: item.type || null,
            serialNumber: item.serialNumber || null,
            specification: item.specification || null,
            quantity: item.quantity ? parseInt(item.quantity) : 1,
            condition: item.condition || "BAIK",
            completeness: item.completeness || null,
            functionStatus: item.functionStatus || null,
            location: item.location || null,
            checkStatus: item.checkStatus || "SUDAH_DICEK",
            note: item.note || null,
          })),
        },
      },
      include: {
        room: true,
        items: true,
      },
    });

    return NextResponse.json({ success: true, data: initial });
  } catch (error) {
    console.error("Error creating initial inventory:", error);
    return NextResponse.json({ error: "Gagal menyimpan pendataan awal" }, { status: 500 });
  }
}
