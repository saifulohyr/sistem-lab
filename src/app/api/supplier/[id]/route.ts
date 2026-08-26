import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "TOOLMAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const { name, contactName, phone, email, address } = await request.json();

    const updated = await prisma.supplier.update({
      where: { id },
      data: {
        name,
        contactName: contactName || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json({ error: "Gagal memperbarui supplier" }, { status: 500 });
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
    
    // Check if supplier is used in IncomingGoods
    const count = await prisma.incomingGoods.count({ where: { supplierId: id } });
    if (count > 0) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus supplier yang sudah memiliki transaksi barang masuk" },
        { status: 400 }
      );
    }

    await prisma.supplier.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json({ error: "Gagal menghapus supplier" }, { status: 500 });
  }
}
