import { NextResponse } from "next/server";
import { checkAdminSecret, setAdminCookie, adminConfigured } from "@/lib/adminAuth";
import { isRateLimited, clientIp } from "@/lib/rateLimit";

export async function POST(req) {
  if (!adminConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  if (await isRateLimited("admin-login", clientIp(), { limit: 10, windowMs: 15 * 60 * 1000 })) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }
  const { secret } = await req.json().catch(() => ({}));
  if (!checkAdminSecret(secret)) return NextResponse.json({ error: "invalid" }, { status: 401 });
  setAdminCookie();
  return NextResponse.json({ ok: true });
}
