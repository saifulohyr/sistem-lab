import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { requireStaff, requireAuth } from "@/lib/rbac";
import { parseValidation, CreateInventorySchema } from "@/lib/validations";

// GET /api/inventaris - List inventaris with filters
export async function GET(request: Request) {
  try {
    const session = await getSession();
    const authError = requireAuth(session);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || undefined;
    const roomId = searchParams.get("roomId") || undefined;
    const condition = searchParams.get("condition") || undefined;
    const status = searchParams.get("status") || undefined;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { serialNumber: { contains: search, mode: "insensitive" } },
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

// POST /api/inventaris - Create new inventory (ADMIN & TOOLMAN only)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    const authError = requireStaff(session);
    if (authError) return authError;

    const body = await request.json();
    const validation = parseValidation(CreateInventorySchema, {
      ...body,
      year: body.year ? Number(body.year) : undefined,
      price: body.price ? Number(body.price) : undefined,
      quantity: body.quantity ? Number(body.quantity) : 1,
    });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const data = validation.data;

    // Check duplicate code
    const existing = await prisma.inventory.findUnique({
      where: { code: data.code },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Kode barang ${data.code} sudah digunakan` },
        { status: 400 }
      );
    }

    const { specs = [], ...inventoryData } = data;

    const inventory = await prisma.inventory.create({
      data: {
        ...inventoryData,
        specs: {
          create: specs
            .filter((s) => s.key && s.value)
            .map((s) => ({ key: s.key, value: s.value })),
        },
        history: {
          create: {
            action: "MASUK",
            description: `Penambahan inventaris baru: ${data.name} (${data.code})`,
            userId: session!.id,
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
