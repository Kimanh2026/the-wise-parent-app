import { NextResponse } from "next/server";
import { findUserByEmail, findUserByGoogleSub, linkGoogleSub } from "@/lib/db";
import { createGoogleUser, createSession, setSessionCookie, publicUser } from "@/lib/auth";
import { verifyGoogleIdToken } from "@/lib/googleAuth";
import { isRateLimited, clientIp } from "@/lib/rateLimit";

export async function POST(req) {
  if (await isRateLimited("google-auth", clientIp(), { limit: 20, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  const { credential, language } = await req.json().catch(() => ({}));
  if (!credential) return NextResponse.json({ error: "missing" }, { status: 400 });

  let claims;
  try {
    claims = await verifyGoogleIdToken(credential);
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }
  if (!claims.emailVerified) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  // Match by Google's stable user id first; fall back to email so someone who
  // signed up with a password originally can also just use Google next time.
  let user = await findUserByGoogleSub(claims.googleSub);
  if (!user) {
    const byEmail = await findUserByEmail(claims.email);
    if (byEmail) {
      await linkGoogleSub(byEmail.id, claims.googleSub);
      user = { ...byEmail, googleSub: claims.googleSub };
    } else {
      user = await createGoogleUser({
        name: claims.name,
        email: claims.email,
        googleSub: claims.googleSub,
        language: language === "vi" ? "vi" : "en",
      });
    }
  }

  setSessionCookie(await createSession(user.id));
  return NextResponse.json({ user: publicUser(user) });
}
