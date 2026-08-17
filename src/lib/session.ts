import { cookies } from "next/headers";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session) return null;
    return JSON.parse(Buffer.from(session.value, "base64").toString());
  } catch {
    return null;
  }
}
