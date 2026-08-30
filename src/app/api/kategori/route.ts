import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { requireStaff } from "@/lib/rbac";
import { parseValidation, CategorySchema } from "@/lib/validations";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { inventories: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Gagal mengambil data kategori" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const authError = requireStaff(session);
    if (authError) return authError;

    const body = await request.json();
    const validation = parseValidation(CategorySchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const { name, description, icon } = validation.data;

    const category = await prisma.category.create({
      data: { name, description: description ?? null, icon: icon ?? "Package" },
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Gagal menambahkan kategori" }, { status: 500 });
  }
}
