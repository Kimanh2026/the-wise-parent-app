import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isRateLimited, clientIp } from "@/lib/rateLimit";
import { notifyAdminOfSupportMessage } from "@/lib/notify";
import { verifyCsrf } from "@/lib/csrf";

// "Liên hệ / Hỗ trợ" — works both logged-in (Settings) and logged-out
// (landing page footer). Logged-in senders are identified from their
// session (never trust client-supplied name/email over that); logged-out
// senders must supply both so there's a real address to reply to.
export async function POST(req) {
  if (!verifyCsrf(req)) return NextResponse.json({ error: "csrf" }, { status: 403 });

  const user = await getSessionUser();
  const identity = user ? user.id : clientIp();
  if (await isRateLimited("support", identity, { limit: 5, windowMs: 60 * 60 * 1000 })) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const message = (body.message || "").trim().slice(0, 4000);
  if (!message) return NextResponse.json({ error: "missing_message" }, { status: 400 });

  let name, email;
  if (user) {
    name = user.name;
    email = user.email;
  } else {
    name = (body.name || "").trim().slice(0, 200);
    email = (body.email || "").trim().slice(0, 200);
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "invalid_contact" }, { status: 400 });
    }
  }

  try {
    await notifyAdminOfSupportMessage({ name, email, message, fromApp: Boolean(user) });
    return NextResponse.json({ ok: true });
  } catch {
    // Email channel isn't configured or failed — tell the client so it can
    // point the person at the Zalo contact instead of a silent "success".
    return NextResponse.json({ error: "email_unavailable" }, { status: 503 });
  }
}
