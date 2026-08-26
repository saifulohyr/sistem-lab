import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const initial = await prisma.initialInventory.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, role: true } },
        room: true,
        items: true,
      },
    });

    if (!initial) {
      return NextResponse.json({ error: "Data pendataan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: initial });
  } catch (error) {
    console.error("Error fetching initial inventory detail:", error);
    return NextResponse.json({ error: "Gagal mengambil data detail pendataan" }, { status: 500 });
  }
}

// PUT /api/pendataan-awal/[id] - Approve or update status
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status, approvedBy } = await request.json();

    const updated = await prisma.initialInventory.update({
      where: { id },
      data: {
        status: status || "DISAHKAN",
        approvedBy: approvedBy || session.name,
        approvedAt: new Date(),
      },
      include: {
        room: true,
        items: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating initial inventory:", error);
    return NextResponse.json({ error: "Gagal memperbarui status pendataan" }, { status: 500 });
  }
}
