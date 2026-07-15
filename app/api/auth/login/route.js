import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db";
import { verifyPassword, createSession, setSessionCookie, publicUser, hashPassword } from "@/lib/auth";
import { isRateLimited, clientIp } from "@/lib/rateLimit";

// Fixed dummy hash so a login for a non-existent email takes about the same
// time as one for a real email (avoids leaking which emails are registered
// via response timing). Value itself is never used to authenticate anything.
const DUMMY_HASH = hashPassword("not-a-real-password-timing-decoy");

export async function POST(req) {
  // 15 attempts / 10 min per IP is enough for a real user who fat-fingers a
  // password, but stops fast automated brute-forcing.
  if (await isRateLimited("login", clientIp(), { limit: 15, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  const { email, password } = await req.json().catch(() => ({}));
  const user = email ? await findUserByEmail(email) : null;
  const valid = verifyPassword(password || "", user ? user.passwordHash : DUMMY_HASH);
  if (!user || !valid) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }
  setSessionCookie(await createSession(user.id));
  return NextResponse.json({ user: publicUser(user) });
}
