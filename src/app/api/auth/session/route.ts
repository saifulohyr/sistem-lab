import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = JSON.parse(Buffer.from(session.value, "base64").toString());
    return NextResponse.json({
      user,
      role: user.role,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
