import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const records = await prisma.borrowing.findMany({
      include: {
        user: { select: { name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ data: records });
  } catch (error) {
    console.error("Error fetching borrowings:", error);
    return NextResponse.json({ error: "Gagal mengambil data peminjaman" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { number, date, borrower, role, purpose, expectedReturn, note, items = [] } = await request.json();

    if (!number || !borrower || !purpose || items.length === 0) {
      return NextResponse.json({ error: "Data wajib (Nomor, Peminjam, Keperluan, Barang) belum lengkap" }, { status: 400 });
    }

    // Check duplicate number
    const existing = await prisma.borrowing.findUnique({ where: { number } });
    if (existing) {
      return NextResponse.json({ error: "Nomor dokumen sudah digunakan" }, { status: 400 });
    }

    const borrowing = await prisma.$transaction(async (tx: any) => {
      // 1. Create borrowing record
      const record = await tx.borrowing.create({
        data: {
          number,
          date: date ? new Date(date) : new Date(),
          borrower,
          role: role || null,
          purpose,
          expectedReturn: expectedReturn ? new Date(expectedReturn) : null,
          note: note || null,
          userId: session.id,
          status: "DIPINJAM",
          items: {
            create: items.map((item: any) => ({
              inventoryId: item.inventoryId,
              quantity: parseInt(item.quantity) || 1,
              note: item.note || null,
            })),
          },
        },
        include: { items: true },
      });

      // 2. Update inventory quantities (decrement because they are borrowed out)
      // Wait, usually borrowing doesn't decrement the "owned" quantity but we need to track available vs total.
      // But in this simple system, maybe we decrement quantity, OR we add a status logic.
      // Let's decrement the quantity, and when returned, increment it back.
      for (const item of record.items) {
        const inventory = await tx.inventory.findUnique({ where: { id: item.inventoryId } });
        if (!inventory || inventory.quantity < item.quantity) {
          throw new Error(`Stok tersedia tidak mencukupi untuk barang ID: ${item.inventoryId}`);
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
            action: "PINJAM",
            description: `Dipinjam oleh ${borrower}. Keperluan: ${purpose}. Jumlah: ${item.quantity}`,
            userId: session.id,
          },
        });
      }

      return record;
    });

    return NextResponse.json({ success: true, data: borrowing });
  } catch (error: any) {
    console.error("Error creating borrowing:", error);
    return NextResponse.json({ error: error.message || "Gagal memproses peminjaman" }, { status: 500 });
  }
}
