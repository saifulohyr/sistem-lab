import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const records = await prisma.incomingGoods.findMany({
      include: {
        supplier: true,
        user: { select: { name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ data: records });
  } catch (error) {
    console.error("Error fetching incoming goods:", error);
    return NextResponse.json({ error: "Gagal mengambil data barang masuk" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { number, date, supplierId, source, documentNo, note, items = [] } = await request.json();

    if (!number || items.length === 0) {
      return NextResponse.json({ error: "Nomor dokumen dan minimal 1 barang wajib diisi" }, { status: 400 });
    }

    // Check duplicate number
    const existing = await prisma.incomingGoods.findUnique({ where: { number } });
    if (existing) {
      return NextResponse.json({ error: "Nomor dokumen sudah digunakan" }, { status: 400 });
    }

    const incoming = await prisma.$transaction(async (tx: any) => {
      // 1. Create incoming record
      const record = await tx.incomingGoods.create({
        data: {
          number,
          date: date ? new Date(date) : new Date(),
          supplierId: supplierId || null,
          source: source || null,
          documentNo: documentNo || null,
          note: note || null,
          userId: session.id,
          items: {
            create: items.map((item: any) => ({
              inventoryId: item.inventoryId,
              quantity: parseInt(item.quantity) || 1,
              price: item.price ? parseFloat(item.price) : null,
              note: item.note || null,
            })),
          },
        },
        include: { items: true },
      });

      // 2. Update inventory quantities and add history
      for (const item of record.items) {
        await tx.inventory.update({
          where: { id: item.inventoryId },
          data: {
            quantity: { increment: item.quantity },
          },
        });

        await tx.inventoryHistory.create({
          data: {
            inventoryId: item.inventoryId,
            action: "MASUK",
            description: `Barang masuk dari supplier. Dokumen: ${number}. Jumlah: ${item.quantity}`,
            userId: session.id,
          },
        });
      }

      return record;
    });

    return NextResponse.json({ success: true, data: incoming });
  } catch (error) {
    console.error("Error creating incoming goods:", error);
    return NextResponse.json({ error: "Gagal memproses barang masuk" }, { status: 500 });
  }
}
