import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { items = [], note } = await request.json();

    const result = await prisma.$transaction(async (tx: any) => {
      const record = await tx.borrowing.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!record) throw new Error("Data peminjaman tidak ditemukan");
      if (record.status === "DIKEMBALIKAN") throw new Error("Peminjaman sudah dikembalikan");

      // 1. Mark borrowing as returned
      const updatedBorrowing = await tx.borrowing.update({
        where: { id },
        data: {
          status: "DIKEMBALIKAN",
          actualReturn: new Date(),
          note: note ? `${record.note ? record.note + '\n' : ''}Pengembalian: ${note}` : record.note,
        },
      });

      // 2. Process each returned item
      for (const item of record.items) {
        // Find matching item payload to get returnCondition
        const returnedItemPayload = items.find((i: any) => i.id === item.id);
        const returnCondition = returnedItemPayload?.returnCondition || "BAIK";

        // Update item condition
        await tx.borrowingItem.update({
          where: { id: item.id },
          data: { returnCondition },
        });

        // Return stock to inventory and update condition if it changed
        await tx.inventory.update({
          where: { id: item.inventoryId },
          data: {
            quantity: { increment: item.quantity },
            condition: returnCondition,
          },
        });

        // Log history
        await tx.inventoryHistory.create({
          data: {
            inventoryId: item.inventoryId,
            action: "KEMBALI",
            description: `Dikembalikan dari peminjaman (${record.borrower}). Kondisi: ${returnCondition}.`,
            userId: session.id,
          },
        });
      }

      return updatedBorrowing;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error processing return:", error);
    return NextResponse.json({ error: error.message || "Gagal memproses pengembalian" }, { status: 500 });
  }
}
