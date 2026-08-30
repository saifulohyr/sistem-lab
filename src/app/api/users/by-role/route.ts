import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/users/by-role?role=GURU or ?role=SISWA
// Public endpoint — returns only name + email (no password)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    if (!role || !["GURU", "SISWA"].includes(role)) {
      return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
    }

    const users = await prisma.user.findMany({
      where: { role, active: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error("Error fetching users by role:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}
