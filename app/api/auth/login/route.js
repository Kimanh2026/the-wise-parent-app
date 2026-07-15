import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db";
import { verifyPassword, createSession, setSessionCookie, publicUser } from "@/lib/auth";

export async function POST(req) {
  const { email, password } = await req.json().catch(() => ({}));
  const user = email ? await findUserByEmail(email) : null;
  if (!user || !verifyPassword(password || "", user.passwordHash)) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }
  setSessionCookie(await createSession(user.id));
  return NextResponse.json({ user: publicUser(user) });
}
