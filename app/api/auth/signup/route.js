import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db";
import { createUser, createSession, setSessionCookie, publicUser } from "@/lib/auth";

export async function POST(req) {
  const { name, email, password, language } = await req.json().catch(() => ({}));
  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: "missing" }, { status: 400 });
  }
  if (password.length < 6) return NextResponse.json({ error: "short" }, { status: 400 });
  if (await findUserByEmail(email)) return NextResponse.json({ error: "exists" }, { status: 409 });
  const user = await createUser({ name, email, password, language });
  setSessionCookie(await createSession(user.id));
  return NextResponse.json({ user: publicUser(user) });
}
