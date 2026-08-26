import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const user = await getSession();

  // Get stats in parallel
  const [
    totalInventory,
    baik,
    rusakRingan,
    rusakBerat,
    tidakDitemukan,
    activeRepairs,
    outgoingCount,
    scheduleCount,
    repairWaiting,
    repairInProgress,
    repairCompleted,
    categories,
    rooms,
    schedules,
    recentHistory,
  ] = await Promise.all([
    prisma.inventory.count(),
    prisma.inventory.count({ where: { condition: "BAIK" } }),
    prisma.inventory.count({ where: { condition: "RUSAK_RINGAN" } }),
    prisma.inventory.count({ where: { condition: "RUSAK_BERAT" } }),
    prisma.inventory.count({ where: { condition: "TIDAK_DITEMUKAN" } }),
    prisma.repair.count({ where: { status: { in: ["DIAGNOSA", "PROSES", "TESTING"] } } }),
    prisma.outgoingGoods.count(),
    prisma.practicumSchedule.count(),
    prisma.repair.count({ where: { status: "DIAGNOSA" } }),
    prisma.repair.count({ where: { status: { in: ["PROSES", "TESTING"] } } }),
    prisma.repair.count({ where: { status: "SELESAI" } }),
    prisma.category.findMany({
      include: { _count: { select: { inventories: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.room.findMany({
      include: { _count: { select: { inventories: true } } },
    }),
    prisma.practicumSchedule.findMany({
      take: 4,
      include: { room: true },
      orderBy: { startTime: "asc" },
    }),
    prisma.inventoryHistory.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        inventory: { select: { code: true, name: true } },
        user: { select: { name: true } },
      },
    }),
  ]);

  const categoryData = categories
    .filter((c: any) => c._count.inventories > 0)
    .map((c: any) => ({
      name: c.name,
      count: c._count.inventories,
    }));

  const roomData = rooms
    .filter((r: any) => r._count.inventories > 0)
    .map((r: any) => ({
      name: r.name,
      count: r._count.inventories,
    }));

  const stats = {
    total: totalInventory,
    baik,
    rusakRingan,
    rusakBerat,
    tidakDitemukan,
    activeRepairs,
    outgoingCount,
    scheduleCount,
    repairWaiting,
    repairInProgress,
    repairCompleted,
  };

  return (
    <DashboardClient
      stats={stats}
      categoryData={categoryData}
      roomData={roomData}
      schedules={schedules.map((s: any) => ({
        id: s.id,
        subject: s.subject,
        teacher: s.teacher,
        className: s.className,
        startTime: s.startTime,
        endTime: s.endTime,
        roomName: s.room?.name || "Lab RPL",
      }))}
      recentHistory={recentHistory.map((h: any) => ({
        id: h.id,
        action: h.action,
        description: h.description,
        createdAt: h.createdAt.toISOString(),
        inventoryCode: h.inventory?.code || "",
        inventoryName: h.inventory?.name || "",
        userName: h.user?.name || "Petugas",
      }))}
      userName={user?.name || "Admin"}
    />
  );
}
