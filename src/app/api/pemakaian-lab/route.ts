import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { requireAuth, requireStaff } from "@/lib/rbac";

// GET — Ambil riwayat pemakaian lab
// Query params: date (YYYY-MM-DD), roomId, startDate, endDate
export async function GET(request: Request) {
  try {
    const session = await getSession();
    const authError = requireAuth(session);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const roomId = searchParams.get("roomId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: Record<string, unknown> = {};

    if (date) {
      // Filter specific date in WIB (UTC+7, standard Indonesian school time)
      // WIB midnight corresponds to 17:00:00 UTC of previous day
      const [y, m, d] = date.split("-").map(Number);
      const startWib = new Date(Date.UTC(y, m - 1, d - 1, 17, 0, 0, 0));
      const endWib = new Date(Date.UTC(y, m - 1, d, 16, 59, 59, 999));
      where.date = { gte: startWib, lte: endWib };
    } else if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) {
        const [y, m, d] = startDate.split("-").map(Number);
        dateFilter.gte = new Date(Date.UTC(y, m - 1, d - 1, 17, 0, 0, 0));
      }
      if (endDate) {
        const [y, m, d] = endDate.split("-").map(Number);
        dateFilter.lte = new Date(Date.UTC(y, m - 1, d, 16, 59, 59, 999));
      }
      where.date = dateFilter;
    }

    if (roomId) where.roomId = roomId;

    const records = await prisma.labUsage.findMany({
      where,
      include: {
        room: { select: { id: true, name: true } },
        user: { select: { name: true } },
      },
      orderBy: [
        { date: "desc" },
        { startPeriod: "asc" },
      ],
    });

    return NextResponse.json({ data: records });
  } catch (error) {
    console.error("Error fetching lab usage:", error);
    return NextResponse.json({ error: "Gagal mengambil data pemakaian lab" }, { status: 500 });
  }
}

// POST — Catat pemakaian lab baru (Staff + Guru)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    const authError = requireAuth(session);
    if (authError) return authError;

    // Hanya ADMIN, TOOLMAN, GURU yang bisa catat
    if (!session || !["ADMIN", "TOOLMAN", "GURU"].includes(session.role)) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await request.json();
    const { roomId, date, startPeriod, endPeriod, startTime, endTime, subject, teacher, className, studentCount, activity, note } = body;

    if (!roomId || !date || !startPeriod || !endPeriod || !startTime || !endTime || !subject || !teacher || !className) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const [y, m, d] = date.split("-").map(Number);
    const dateToStore = new Date(Date.UTC(y, m - 1, d - 1, 17, 0, 0, 0));

    const record = await prisma.labUsage.create({
      data: {
        roomId,
        date: dateToStore,
        startPeriod: Number(startPeriod),
        endPeriod: Number(endPeriod),
        startTime,
        endTime,
        subject,
        teacher,
        className,
        studentCount: studentCount ? Number(studentCount) : null,
        activity: activity || null,
        note: note || null,
        userId: session.id,
      },
      include: {
        room: { select: { id: true, name: true } },
        user: { select: { name: true } },
      },
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Error creating lab usage:", error);
    return NextResponse.json({ error: "Gagal mencatat pemakaian lab" }, { status: 500 });
  }
}

// DELETE — Hapus pemakaian berdasarkan tanggal (bulk) atau single ID
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    const authError = requireStaff(session);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const date = searchParams.get("date");

    if (id) {
      await prisma.labUsage.delete({ where: { id } });
    } else if (date) {
      const [y, m, d] = date.split("-").map(Number);
      const startWib = new Date(Date.UTC(y, m - 1, d - 1, 17, 0, 0, 0));
      const endWib = new Date(Date.UTC(y, m - 1, d, 16, 59, 59, 999));
      await prisma.labUsage.deleteMany({
        where: { date: { gte: startWib, lte: endWib } },
      });
    } else {
      return NextResponse.json({ error: "Harap sertakan id atau date" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lab usage:", error);
    return NextResponse.json({ error: "Gagal menghapus data pemakaian lab" }, { status: 500 });
  }
}
