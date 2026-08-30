import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { requireAuth } from "@/lib/rbac";

// GET /api/search?q=<query> — search across Inventory, Category, Room
export async function GET(request: Request) {
  try {
    const session = await getSession();
    const authError = requireAuth(session);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";

    if (!q || q.length < 2) {
      return NextResponse.json({ data: { inventories: [], categories: [], rooms: [] } });
    }

    const [inventories, categories, rooms] = await Promise.all([
      prisma.inventory.findMany({
        where: {
          OR: [
            { code: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
            { serialNumber: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          code: true,
          name: true,
          condition: true,
          status: true,
          category: { select: { name: true } },
          room: { select: { name: true } },
        },
        take: 8,
      }),
      prisma.category.findMany({
        where: { name: { contains: q, mode: "insensitive" } },
        select: { id: true, name: true, icon: true, _count: { select: { inventories: true } } },
        take: 4,
      }),
      prisma.room.findMany({
        where: { name: { contains: q, mode: "insensitive" } },
        select: { id: true, name: true, capacity: true, _count: { select: { inventories: true } } },
        take: 4,
      }),
    ]);

    return NextResponse.json({
      data: { inventories, categories, rooms },
      query: q,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Gagal melakukan pencarian" }, { status: 500 });
  }
}
