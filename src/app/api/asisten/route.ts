import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const records = await prisma.labAssistant.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ data: records });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data asisten" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "TOOLMAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    
    // Check existing NIS
    const existing = await prisma.labAssistant.findUnique({ where: { nis: body.nis } });
    if (existing) {
      return NextResponse.json({ error: "NIS sudah terdaftar sebagai asisten" }, { status: 400 });
    }

    const asisten = await prisma.labAssistant.create({ data: body });

    return NextResponse.json({ success: true, data: asisten });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan data asisten" }, { status: 500 });
  }
}
