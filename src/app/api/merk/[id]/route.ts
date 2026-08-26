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
    const { name } = await request.json();

    const updated = await prisma.brand.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json({ error: "Gagal memperbarui merk" }, { status: 500 });
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
    const count = await prisma.inventory.count({ where: { brandId: id } });
    if (count > 0) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus merk yang masih digunakan pada inventaris" },
        { status: 400 }
      );
    }

    await prisma.brand.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json({ error: "Gagal menghapus merk" }, { status: 500 });
  }
}
