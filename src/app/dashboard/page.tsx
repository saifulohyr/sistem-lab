import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const user = await getSession();

  // Get inventory stats
  const [total, baik, rusakRingan, rusakBerat, tidakDitemukan] = await Promise.all([
    prisma.inventory.count(),
    prisma.inventory.count({ where: { condition: "BAIK" } }),
    prisma.inventory.count({ where: { condition: "RUSAK_RINGAN" } }),
    prisma.inventory.count({ where: { condition: "RUSAK_BERAT" } }),
    prisma.inventory.count({ where: { condition: "TIDAK_DITEMUKAN" } }),
  ]);

  // Get inventory by category
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { inventories: true } },
    },
    orderBy: { name: "asc" },
  });

  const categoryData = categories
    .filter((c) => c._count.inventories > 0)
    .map((c) => ({
      name: c.name,
      count: c._count.inventories,
    }));

  // Get inventory by room
  const rooms = await prisma.room.findMany({
    include: {
      _count: { select: { inventories: true } },
    },
  });

  const roomData = rooms
    .filter((r) => r._count.inventories > 0)
    .map((r) => ({
      name: r.name,
      count: r._count.inventories,
    }));

  // Recent history
  const recentHistory = await prisma.inventoryHistory.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      inventory: { select: { code: true, name: true } },
      user: { select: { name: true } },
    },
  });

  const stats = { total, baik, rusakRingan, rusakBerat, tidakDitemukan };

  return (
    <DashboardClient
      stats={stats}
      categoryData={categoryData}
      roomData={roomData}
      recentHistory={recentHistory.map((h) => ({
        id: h.id,
        action: h.action,
        description: h.description,
        createdAt: h.createdAt.toISOString(),
        inventoryCode: h.inventory?.code || "",
        inventoryName: h.inventory?.name || "",
        userName: h.user?.name || "",
      }))}
      userName={user?.name || ""}
    />
  );
}
