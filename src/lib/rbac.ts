import { NextResponse } from "next/server";
import type { SessionUser } from "./session";

export type Role = "ADMIN" | "TOOLMAN" | "GURU" | "SISWA";

/**
 * Check if a session user has one of the required roles.
 * Returns null if authorized, or a NextResponse 403 if not.
 */
export function requireRole(
  session: SessionUser | null,
  allowedRoles: Role[]
): NextResponse | null {
  if (!session) {
    return NextResponse.json(
      { error: "Tidak terautentikasi. Silakan login kembali." },
      { status: 401 }
    );
  }
  if (!allowedRoles.includes(session.role as Role)) {
    return NextResponse.json(
      {
        error: `Akses ditolak. Halaman ini hanya untuk: ${allowedRoles.join(", ")}`,
      },
      { status: 403 }
    );
  }
  return null; // authorized
}

/**
 * Shorthand: require the user to be logged in at minimum (all roles).
 */
export function requireAuth(session: SessionUser | null): NextResponse | null {
  return requireRole(session, ["ADMIN", "TOOLMAN", "GURU", "SISWA"]);
}

/**
 * Shorthand: only ADMIN and TOOLMAN (staff lab).
 */
export function requireStaff(session: SessionUser | null): NextResponse | null {
  return requireRole(session, ["ADMIN", "TOOLMAN"]);
}

/**
 * Shorthand: ADMIN and TOOLMAN (management — same as staff since KEPALA_LAB removed).
 */
export function requireManagement(session: SessionUser | null): NextResponse | null {
  return requireRole(session, ["ADMIN", "TOOLMAN"]);
}

/**
 * Shorthand: only ADMIN.
 */
export function requireAdmin(session: SessionUser | null): NextResponse | null {
  return requireRole(session, ["ADMIN"]);
}

/**
 * Jadwal: GURU, SISWA, TOOLMAN, ADMIN — semua bisa lihat.
 * GURU bisa mengajukan jadwal, ADMIN/TOOLMAN approve.
 */
export function requireJadwalWrite(session: SessionUser | null): NextResponse | null {
  return requireRole(session, ["ADMIN", "TOOLMAN", "GURU"]);
}
