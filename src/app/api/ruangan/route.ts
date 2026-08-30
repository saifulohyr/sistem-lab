import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { requireStaff } from "@/lib/rbac";
import { parseValidation, RoomSchema } from "@/lib/validations";

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
    const authError = requireStaff(session);
    if (authError) return authError;

    const body = await request.json();

    // Use existing location or default if none provided
    let resolvedLocationId = body.locationId;
    if (!resolvedLocationId) {
      const defaultLoc = await prisma.location.findFirst();
      resolvedLocationId = defaultLoc?.id;
    }

    const validation = parseValidation(RoomSchema, {
      ...body,
      locationId: resolvedLocationId,
      capacity: body.capacity ? Number(body.capacity) : undefined,
    });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const { name, locationId, capacity, note } = validation.data;

    const room = await prisma.room.create({
      data: {
        name,
        locationId,
        capacity: capacity ?? null,
        note: note ?? null,
      },
    });

    return NextResponse.json({ success: true, data: room });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json({ error: "Gagal menambahkan ruangan" }, { status: 500 });
  }
}
