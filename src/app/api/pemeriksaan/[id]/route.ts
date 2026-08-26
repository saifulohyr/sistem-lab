import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: {
        room: true,
        inspector: { select: { name: true } },
        items: {
          include: {
            inventory: { select: { name: true, code: true, position: true } }
          }
        }
      },
    });

    if (!inspection) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: inspection });
  } catch (error) {
    console.error("Error fetching inspection detail:", error);
    return NextResponse.json({ error: "Gagal mengambil detail pemeriksaan" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { items, note } = await request.json();
    
    // items = [{ id: string, status: string, note: string }]
    
    await prisma.$transaction(async (tx: any) => {
      // Update note
      if (note !== undefined) {
        await tx.inspection.update({
          where: { id },
          data: { note },
        });
      }

      // Update items
      if (items && Array.isArray(items)) {
        for (const item of items) {
          await tx.inspectionItem.update({
            where: { id: item.id },
            data: { 
              status: item.status,
              note: item.note || null
            },
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating inspection:", error);
    return NextResponse.json({ error: "Gagal menyimpan hasil pemeriksaan" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.inspection.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting inspection:", error);
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
