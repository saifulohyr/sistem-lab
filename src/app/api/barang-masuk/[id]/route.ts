import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await prisma.incomingGoods.findUnique({
      where: { id },
      include: {
        supplier: true,
        user: { select: { name: true } },
        items: {
          include: {
            inventory: { select: { code: true, name: true, category: true } }
          }
        },
      },
    });

    if (!record) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Error fetching incoming goods detail:", error);
    return NextResponse.json({ error: "Gagal mengambil detail barang masuk" }, { status: 500 });
  }
}

// NOTE: Usually we don't allow editing/deleting finalized transactions easily,
// but we'll add DELETE for admins for error correction.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.$transaction(async (tx: any) => {
      const record = await tx.incomingGoods.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!record) throw new Error("Not found");

      // Rollback inventory quantities
      for (const item of record.items) {
        await tx.inventory.update({
          where: { id: item.inventoryId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      await tx.incomingGoods.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting incoming goods:", error);
    return NextResponse.json({ error: "Gagal menghapus transaksi" }, { status: 500 });
  }
}
