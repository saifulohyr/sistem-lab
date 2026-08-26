import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// GET /api/inventaris - List inventaris with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || undefined;
    const roomId = searchParams.get("roomId") || undefined;
    const condition = searchParams.get("condition") || undefined;
    const status = searchParams.get("status") || undefined;

    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
        { serialNumber: { contains: search } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (roomId) where.roomId = roomId;
    if (condition) where.condition = condition;
    if (status) where.status = status;

    const inventories = await prisma.inventory.findMany({
      where,
      include: {
        category: true,
        brand: true,
        room: true,
        specs: true,
      },
      orderBy: { code: "asc" },
    });

    return NextResponse.json({ data: inventories });
  } catch (error) {
    console.error("Error fetching inventories:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data inventaris" },
      { status: 500 }
    );
  }
}

// POST /api/inventaris - Create new inventory
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      code,
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
      condition = "BAIK",
      status = "AKTIF",
      quantity = 1,
      note,
      specs = [],
    } = body;

    if (!code || !name || !categoryId) {
      return NextResponse.json(
        { error: "Kode, Nama, dan Kategori wajib diisi" },
        { status: 400 }
      );
    }

    // Check duplicate code
    const existing = await prisma.inventory.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Kode barang ${code} sudah digunakan` },
        { status: 400 }
      );
    }

    const inventory = await prisma.inventory.create({
      data: {
        code,
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
            action: "MASUK",
            description: `Penambahan inventaris baru: ${name} (${code})`,
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

    return NextResponse.json({ success: true, data: inventory });
  } catch (error) {
    console.error("Error creating inventory:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan inventaris baru" },
      { status: 500 }
    );
  }
}
