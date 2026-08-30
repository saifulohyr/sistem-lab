import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { requireAdmin } from "@/lib/rbac";
import { hashPassword } from "@/lib/bcrypt";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id } = await params;

    // Allow admin to edit anyone; other users can only edit themselves
    if (!session || (session.role !== "ADMIN" && session.id !== id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, email, password, role, active } = await request.json();

    const data: Record<string, unknown> = {};
    if (name) data.name = String(name).trim();
    if (email) data.email = String(email).trim();

    // Hash password if updating
    if (password) {
      data.password = await hashPassword(String(password));
    }

    // Only admin can change role and active status
    if (session.role === "ADMIN") {
      if (role) data.role = role;
      if (active !== undefined) data.active = Boolean(active);
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Gagal memperbarui pengguna" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    if (id === session.id) {
      return NextResponse.json({ error: "Tidak dapat menghapus akun sendiri" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Gagal menghapus pengguna" }, { status: 500 });
  }
}
