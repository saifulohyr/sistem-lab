import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        _count: { select: { inventories: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ data: brands });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json({ error: "Gagal mengambil data merk" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Nama merk wajib diisi" }, { status: 400 });
    }

    const brand = await prisma.brand.create({
      data: { name },
    });

    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json({ error: "Gagal menambahkan merk" }, { status: 500 });
  }
}
