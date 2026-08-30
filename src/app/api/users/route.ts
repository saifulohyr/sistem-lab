import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { requireAdmin } from "@/lib/rbac";
import { parseValidation, CreateUserSchema, UpdateUserSchema } from "@/lib/validations";
import { hashPassword } from "@/lib/bcrypt";

export async function GET() {
  try {
    const session = await getSession();
    const authError = requireAdmin(session);
    if (authError) return authError;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Gagal mengambil data user" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const authError = requireAdmin(session);
    if (authError) return authError;

    const body = await request.json();
    const validation = parseValidation(CreateUserSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const { name, email, password, role } = validation.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    // Hash password before saving
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role ?? "TOOLMAN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Gagal menambahkan pengguna" }, { status: 500 });
  }
}
