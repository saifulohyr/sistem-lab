import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        location: true,
        _count: { select: { inventories: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ data: rooms });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json({ error: "Gagal mengambil data ruangan" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, locationId, capacity, note } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Nama ruangan wajib diisi" }, { status: 400 });
    }

    // Use existing location or create default if none provided
    let locId = locationId;
    if (!locId) {
      const defaultLoc = await prisma.location.findFirst();
      locId = defaultLoc?.id;
    }

    const room = await prisma.room.create({
      data: {
        name,
        locationId: locId,
        capacity: capacity ? parseInt(capacity) : null,
        note: note || null,
      },
    });

    return NextResponse.json({ success: true, data: room });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json({ error: "Gagal menambahkan ruangan" }, { status: 500 });
  }
}
