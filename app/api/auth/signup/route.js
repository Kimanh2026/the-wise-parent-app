import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db";
import { createUser, createSession, setSessionCookie, publicUser } from "@/lib/auth";
import { isRateLimited, clientIp } from "@/lib/rateLimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  // Signup is cheap to abuse for spam accounts; keep the ceiling low per IP.
  if (await isRateLimited("signup", clientIp(), { limit: 8, windowMs: 60 * 60 * 1000 })) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  const { name, email, password, language } = await req.json().catch(() => ({}));
  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: "missing" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email.trim())) return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "short" }, { status: 400 });
  if (await findUserByEmail(email)) return NextResponse.json({ error: "exists" }, { status: 409 });
  const user = await createUser({ name, email, password, language });
  setSessionCookie(await createSession(user.id));
  return NextResponse.json({ user: publicUser(user) });
}
