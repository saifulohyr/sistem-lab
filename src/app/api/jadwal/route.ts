import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { requireAuth, requireJadwalWrite, requireStaff } from "@/lib/rbac";
import { parseValidation, JadwalSchema } from "@/lib/validations";

// GET — semua role bisa lihat jadwal
// Siswa & Guru hanya lihat yang DISETUJUI
// Staff (Admin/Toolman) lihat semua termasuk MENUNGGU
export async function GET() {
  try {
    const session = await getSession();

    let where: any = { status: "DISETUJUI" };
    if (session) {
      if (["ADMIN", "TOOLMAN"].includes(session.role)) {
        where = {};
      } else if (session.role === "GURU") {
        where = {
          OR: [
            { status: "DISETUJUI" },
            { requestedById: session.id }
          ]
        };
      }
    }

    const records = await prisma.practicumSchedule.findMany({
      where,
      include: { room: true, requestedBy: { select: { name: true } } },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" }
      ],
    });
    return NextResponse.json({ data: records });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json({ error: "Gagal mengambil data jadwal" }, { status: 500 });
  }
}

// POST — GURU, TOOLMAN, ADMIN bisa tambah jadwal
// Guru: status otomatis MENUNGGU (perlu approve Toolman)
// Toolman/Admin: status langsung DISETUJUI
export async function POST(request: Request) {
  try {
    const session = await getSession();
    const authError = requireJadwalWrite(session);
    if (authError) return authError;

    const body = await request.json();
    const validation = parseValidation(JadwalSchema, {
      ...body,
      dayOfWeek: Number(body.dayOfWeek),
    });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const data = validation.data;

    // Guru → MENUNGGU, Staff → langsung DISETUJUI
    const isStaff = ["ADMIN", "TOOLMAN"].includes(session!.role);
    const status = isStaff ? "DISETUJUI" : "MENUNGGU";

    const schedule = await prisma.practicumSchedule.create({
      data: {
        roomId: data.roomId,
        subject: data.subject,
        teacher: data.teacher,
        className: data.className,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        academicYear: data.academicYear,
        semester: data.semester,
        status,
        requestedById: session!.id,
        approvedAt: isStaff ? new Date() : null,
      },
      include: { room: true },
    });

    return NextResponse.json({ success: true, data: schedule });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json({ error: "Gagal menyimpan jadwal" }, { status: 500 });
  }
}

// PATCH — Toolman/Admin approve atau reject jadwal
export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    const authError = requireStaff(session);
    if (authError) return authError;

    const body = await request.json();
    const { id, status } = body;

    if (!id || !["DISETUJUI", "DITOLAK"].includes(status)) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const schedule = await prisma.practicumSchedule.update({
      where: { id },
      data: {
        status,
        approvedAt: status === "DISETUJUI" ? new Date() : null,
      },
      include: { room: true },
    });

    return NextResponse.json({ success: true, data: schedule });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json({ error: "Gagal mengubah status jadwal" }, { status: 500 });
  }
}
