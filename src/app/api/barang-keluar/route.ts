import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const records = await prisma.outgoingGoods.findMany({
      include: {
        user: { select: { name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ data: records });
  } catch (error) {
    console.error("Error fetching outgoing goods:", error);
    return NextResponse.json({ error: "Gagal mengambil data barang keluar" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { number, date, type, destination, note, items = [] } = await request.json();

    if (!number || !type || items.length === 0) {
      return NextResponse.json({ error: "Nomor dokumen, jenis, dan minimal 1 barang wajib diisi" }, { status: 400 });
    }

    // Check duplicate number
    const existing = await prisma.outgoingGoods.findUnique({ where: { number } });
    if (existing) {
      return NextResponse.json({ error: "Nomor dokumen sudah digunakan" }, { status: 400 });
    }

    const outgoing = await prisma.$transaction(async (tx: any) => {
      // 1. Create outgoing record
      const record = await tx.outgoingGoods.create({
        data: {
          number,
          date: date ? new Date(date) : new Date(),
          type,
          destination: destination || null,
          note: note || null,
          userId: session.id,
          items: {
            create: items.map((item: any) => ({
              inventoryId: item.inventoryId,
              quantity: parseInt(item.quantity) || 1,
              reason: item.reason || null,
              note: item.note || null,
            })),
          },
        },
        include: { items: true },
      });

      // 2. Update inventory quantities and add history
      for (const item of record.items) {
        // First check if sufficient quantity
        const inventory = await tx.inventory.findUnique({ where: { id: item.inventoryId } });
        if (!inventory || inventory.quantity < item.quantity) {
          throw new Error(`Stok tidak mencukupi untuk barang ID: ${item.inventoryId}`);
        }

        await tx.inventory.update({
          where: { id: item.inventoryId },
          data: {
            quantity: { decrement: item.quantity },
          },
        });

        await tx.inventoryHistory.create({
          data: {
            inventoryId: item.inventoryId,
            action: "KELUAR",
            description: `Barang keluar (${type}). Dokumen: ${number}. Jumlah: ${item.quantity}. Tujuan: ${destination || '-'}`,
            userId: session.id,
          },
        });
      }

      return record;
    });

    return NextResponse.json({ success: true, data: outgoing });
  } catch (error: any) {
    console.error("Error creating outgoing goods:", error);
    return NextResponse.json({ error: error.message || "Gagal memproses barang keluar" }, { status: 500 });
  }
}
