import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const { name, capacity, note } = await request.json();

    const updated = await prisma.room.update({
      where: { id },
      data: {
        name,
        capacity: capacity ? parseInt(capacity) : null,
        note: note || null,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json({ error: "Gagal memperbarui ruangan" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    // Check if room has inventories
    const hasInventory = await prisma.inventory.count({ where: { roomId: id } });
    if (hasInventory > 0) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus ruangan yang memiliki barang inventaris" },
        { status: 400 }
      );
    }

    await prisma.room.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json({ error: "Gagal menghapus ruangan" }, { status: 500 });
  }
}
