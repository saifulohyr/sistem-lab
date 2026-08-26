import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "INVENTARIS";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const roomId = searchParams.get("roomId");
    const categoryId = searchParams.get("categoryId");
    const condition = searchParams.get("condition");
    const status = searchParams.get("status");

    // Helper date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }

    let reportData: any[] = [];
    let summary: any = {};

    switch (type) {
      case "INVENTARIS": {
        const where: any = {};
        if (roomId) where.roomId = roomId;
        if (categoryId) where.categoryId = categoryId;
        if (condition) where.condition = condition;
        if (status) where.status = status;

        const items = await prisma.inventory.findMany({
          where,
          include: {
            category: { select: { name: true } },
            brand: { select: { name: true } },
            room: { select: { name: true } },
          },
          orderBy: { code: "asc" },
        });

        reportData = items.map((it: any) => ({
          id: it.id,
          code: it.code,
          name: it.name,
          category: it.category?.name || "-",
          brand: it.brand?.name || "-",
          type: it.type || "-",
          serialNumber: it.serialNumber || "-",
          room: it.room?.name || "-",
          position: it.position || "-",
          condition: it.condition,
          status: it.status,
          quantity: it.quantity,
          price: it.price || 0,
          source: it.source || "-",
          year: it.year || "-",
        }));

        summary = {
          totalItems: reportData.length,
          totalQuantity: reportData.reduce((acc, it) => acc + it.quantity, 0),
          totalValue: reportData.reduce((acc, it) => acc + (it.price * it.quantity), 0),
          baik: reportData.filter(it => it.condition === "BAIK").length,
          rusakRingan: reportData.filter(it => it.condition === "RUSAK_RINGAN").length,
          rusakBerat: reportData.filter(it => it.condition === "RUSAK_BERAT").length,
        };
        break;
      }

      case "PEMINJAMAN": {
        const where: any = {};
        if (startDate || endDate) where.date = dateFilter;
        if (status) where.status = status;

        const records = await prisma.borrowing.findMany({
          where,
          include: {
            user: { select: { name: true } },
            items: {
              include: {
                inventory: { select: { code: true, name: true } }
              }
            }
          },
          orderBy: { date: "desc" },
        });

        reportData = records.map((rec: any) => ({
          id: rec.id,
          number: rec.number,
          date: rec.date.toISOString(),
          borrower: rec.borrower,
          role: rec.role || "-",
          purpose: rec.purpose,
          expectedReturn: rec.expectedReturn ? rec.expectedReturn.toISOString() : null,
          actualReturn: rec.actualReturn ? rec.actualReturn.toISOString() : null,
          status: rec.status,
          itemCount: rec.items.length,
          itemsList: rec.items.map((i: any) => `${i.inventory.name} (${i.quantity}x)`).join(", "),
          recordedBy: rec.user.name,
        }));

        summary = {
          totalTransactions: reportData.length,
          active: reportData.filter(r => r.status === "DIPINJAM").length,
          returned: reportData.filter(r => r.status === "DIKEMBALIKAN").length,
        };
        break;
      }

      case "PERBAIKAN": {
        const where: any = {};
        if (startDate || endDate) where.date = dateFilter;
        if (status) where.status = status;

        const records = await prisma.repair.findMany({
          where,
          include: {
            inventory: { select: { code: true, name: true } },
            technician: { select: { name: true } },
            parts: true,
          },
          orderBy: { date: "desc" },
        });

        reportData = records.map((rec: any) => ({
          id: rec.id,
          number: rec.number,
          date: rec.date.toISOString(),
          inventoryCode: rec.inventory.code,
          inventoryName: rec.inventory.name,
          damageType: rec.damageType || "-",
          severity: rec.severity || "-",
          diagnosis: rec.diagnosis || "-",
          action: rec.action || "-",
          result: rec.result || "-",
          status: rec.status,
          technician: rec.technician.name,
          cost: rec.cost || 0,
          partsCount: rec.parts.length,
        }));

        summary = {
          totalTickets: reportData.length,
          selesai: reportData.filter(r => r.status === "SELESAI").length,
          proses: reportData.filter(r => r.status === "PROSES" || r.status === "DIAGNOSA" || r.status === "TESTING").length,
          totalCost: reportData.reduce((acc, r) => acc + (r.cost || 0), 0),
        };
        break;
      }

      case "PEMELIHARAAN": {
        const where: any = {};
        if (startDate || endDate) where.date = dateFilter;

        const records = await prisma.maintenance.findMany({
          where,
          include: {
            technician: { select: { name: true } },
          },
          orderBy: { date: "desc" },
        });

        reportData = records.map((rec: any) => ({
          id: rec.id,
          number: rec.number,
          date: rec.date.toISOString(),
          type: rec.type,
          title: rec.title,
          description: rec.description,
          result: rec.result || "-",
          technician: rec.technician.name,
        }));

        summary = {
          totalMaintenance: reportData.length,
          preventive: reportData.filter(r => r.type === "PREVENTIVE").length,
          corrective: reportData.filter(r => r.type === "CORRECTIVE").length,
        };
        break;
      }

      case "MASUK_KELUAR": {
        const [incoming, outgoing] = await Promise.all([
          prisma.incomingGoods.findMany({
            where: startDate || endDate ? { date: dateFilter } : {},
            include: {
              supplier: true,
              user: { select: { name: true } },
              items: { include: { inventory: { select: { code: true, name: true } } } },
            },
            orderBy: { date: "desc" },
          }),
          prisma.outgoingGoods.findMany({
            where: startDate || endDate ? { date: dateFilter } : {},
            include: {
              user: { select: { name: true } },
              items: { include: { inventory: { select: { code: true, name: true } } } },
            },
            orderBy: { date: "desc" },
          }),
        ]);

        const combined: any[] = [];

        incoming.forEach((inc: any) => {
          inc.items.forEach((item: any) => {
            combined.push({
              id: `${inc.id}-${item.id}`,
              type: "MASUK",
              number: inc.number,
              date: inc.date.toISOString(),
              inventoryCode: item.inventory?.code || "-",
              inventoryName: item.inventory?.name || "-",
              quantity: item.quantity,
              party: inc.supplier?.name || inc.source || "Pengadaan",
              note: inc.note || item.note || "-",
              user: inc.user.name,
            });
          });
        });

        outgoing.forEach((outg: any) => {
          outg.items.forEach((item: any) => {
            combined.push({
              id: `${outg.id}-${item.id}`,
              type: "KELUAR",
              number: outg.number,
              date: outg.date.toISOString(),
              inventoryCode: item.inventory?.code || "-",
              inventoryName: item.inventory?.name || "-",
              quantity: item.quantity,
              party: outg.destination || outg.type,
              note: outg.note || item.reason || "-",
              user: outg.user.name,
            });
          });
        });

        // Sort by date desc
        combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        reportData = combined;

        summary = {
          totalMutations: reportData.length,
          totalIncomingQty: combined.filter(r => r.type === "MASUK").reduce((acc, r) => acc + r.quantity, 0),
          totalOutgoingQty: combined.filter(r => r.type === "KELUAR").reduce((acc, r) => acc + r.quantity, 0),
        };
        break;
      }

      default:
        return NextResponse.json({ error: "Jenis laporan tidak valid" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      type,
      filter: { startDate, endDate, roomId, categoryId, condition, status },
      summary,
      data: reportData,
    });
  } catch (error) {
    console.error("Error generating report data:", error);
    return NextResponse.json({ error: "Gagal mengambil data laporan" }, { status: 500 });
  }
}
