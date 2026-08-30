import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { requireStaff } from "@/lib/rbac";
import { parseValidation, SupplierSchema } from "@/lib/validations";

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
    const authError = requireStaff(session);
    if (authError) return authError;

    const body = await request.json();
    const validation = parseValidation(SupplierSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const { name, contactName, phone, email, address } = validation.data;

    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactName: contactName ?? null,
        phone: phone ?? null,
        email: email ?? null,
        address: address ?? null,
      },
    });

    return NextResponse.json({ success: true, data: supplier });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json({ error: "Gagal menambahkan supplier" }, { status: 500 });
  }
}
