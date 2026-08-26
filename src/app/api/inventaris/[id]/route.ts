import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// GET /api/inventaris/[id] - Get detail inventory
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inventory = await prisma.inventory.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        room: true,
        specs: true,
        photos: true,
        history: {
          include: {
            user: { select: { name: true, role: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!inventory) {
      return NextResponse.json(
        { error: "Inventaris tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: inventory });
  } catch (error) {
    console.error("Error fetching inventory detail:", error);
    return NextResponse.json(
      { error: "Gagal mengambil detail inventaris" },
      { status: 500 }
    );
  }
}

// PUT /api/inventaris/[id] - Update inventory
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
    const body = await request.json();
    const {
      name,
      categoryId,
      brandId,
      type,
      serialNumber,
      year,
      source,
      price,
      documentNo,
      roomId,
      position,
      condition,
      status,
      quantity,
      note,
      specs = [],
    } = body;

    const current = await prisma.inventory.findUnique({
      where: { id },
    });

    if (!current) {
      return NextResponse.json(
        { error: "Inventaris tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check condition / status changes for audit history
    let changeDesc = `Memperbarui data ${current.code}`;
    if (current.condition !== condition) {
      changeDesc += ` (Kondisi: ${current.condition} → ${condition})`;
    }
    if (current.status !== status) {
      changeDesc += ` (Status: ${current.status} → ${status})`;
    }

    // Delete existing specs and recreate
    await prisma.inventorySpec.deleteMany({
      where: { inventoryId: id },
    });

    const updated = await prisma.inventory.update({
      where: { id },
      data: {
        name,
        categoryId,
        brandId: brandId || null,
        type: type || null,
        serialNumber: serialNumber || null,
        year: year ? parseInt(year) : null,
        source: source || null,
        price: price ? parseFloat(price) : null,
        documentNo: documentNo || null,
        roomId: roomId || null,
        position: position || null,
        condition,
        status,
        quantity: parseInt(quantity) || 1,
        note: note || null,
        specs: {
          create: specs
            .filter((s: { key: string; value: string }) => s.key && s.value)
            .map((s: { key: string; value: string }) => ({
              key: s.key,
              value: s.value,
            })),
        },
        history: {
          create: {
            action: "UPDATE",
            description: changeDesc,
            userId: session.id,
          },
        },
      },
      include: {
        category: true,
        brand: true,
        room: true,
        specs: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating inventory:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui inventaris" },
      { status: 500 }
    );
  }
}

// DELETE /api/inventaris/[id] - Soft delete / delete inventory
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "TOOLMAN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const current = await prisma.inventory.findUnique({
      where: { id },
    });

    if (!current) {
      return NextResponse.json(
        { error: "Inventaris tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete inventory (cascades to specs, history, photos)
    await prisma.inventory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting inventory:", error);
    return NextResponse.json(
      { error: "Gagal menghapus inventaris" },
      { status: 500 }
    );
  }
}
