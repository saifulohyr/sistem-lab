import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { requireStaff } from "@/lib/rbac";
import { parseValidation, BrandSchema } from "@/lib/validations";

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
    const authError = requireStaff(session);
    if (authError) return authError;

    const body = await request.json();
    const validation = parseValidation(BrandSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const brand = await prisma.brand.create({
      data: { name: validation.data.name },
    });

    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json({ error: "Gagal menambahkan merk" }, { status: 500 });
  }
}
