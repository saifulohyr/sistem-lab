import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const records = await prisma.practicumSchedule.findMany({
      include: { room: true },
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

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      roomId,
      subject,
      teacher,
      className,
      dayOfWeek,
      startTime,
      endTime,
      academicYear = "2026/2027",
      semester = "GANJIL",
    } = body;

    if (!roomId || !subject || !teacher || !className || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json({ error: "Kolom Lab, Mapel, Guru, Kelas, Hari, dan Jam wajib diisi" }, { status: 400 });
    }

    const schedule = await prisma.practicumSchedule.create({
      data: {
        roomId,
        subject,
        teacher,
        className,
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
        academicYear,
        semester,
      },
      include: {
        room: true,
      },
    });

    return NextResponse.json({ success: true, data: schedule });
  } catch (error: any) {
    console.error("Error creating schedule:", error);
    return NextResponse.json({ error: error.message || "Gagal menyimpan jadwal" }, { status: 500 });
  }
}
