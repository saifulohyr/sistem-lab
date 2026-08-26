import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const records = await prisma.software.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ data: records });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data software" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "TOOLMAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const software = await prisma.software.create({ data: body });

    return NextResponse.json({ success: true, data: software });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan data software" }, { status: 500 });
  }
}
