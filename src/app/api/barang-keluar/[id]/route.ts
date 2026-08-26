import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await prisma.outgoingGoods.findUnique({
      where: { id },
      include: {
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
    console.error("Error fetching outgoing goods detail:", error);
    return NextResponse.json({ error: "Gagal mengambil detail barang keluar" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.$transaction(async (tx: any) => {
      const record = await tx.outgoingGoods.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!record) throw new Error("Not found");

      // Rollback inventory quantities
      for (const item of record.items) {
        await tx.inventory.update({
          where: { id: item.inventoryId },
          data: { quantity: { increment: item.quantity } },
        });
      }

      await tx.outgoingGoods.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting outgoing goods:", error);
    return NextResponse.json({ error: "Gagal menghapus transaksi" }, { status: 500 });
  }
}
