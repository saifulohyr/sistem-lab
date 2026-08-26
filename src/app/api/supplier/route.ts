import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ data: suppliers });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json({ error: "Gagal mengambil data supplier" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "TOOLMAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, contactName, phone, email, address } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Nama supplier wajib diisi" }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactName: contactName || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
      },
    });

    return NextResponse.json({ success: true, data: supplier });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json({ error: "Gagal menambahkan supplier" }, { status: 500 });
  }
}
