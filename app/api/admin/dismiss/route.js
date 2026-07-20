import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { verifyCsrf } from "@/lib/csrf";
import { findUserById, updateUser } from "@/lib/db";

// Clears a pending request without activating anything (e.g. it was a
// mistake, spam, or the customer never actually paid).
export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!verifyCsrf(req)) return NextResponse.json({ error: "csrf" }, { status: 403 });

  const { userId } = await req.json().catch(() => ({}));
  const user = await findUserById(userId);
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { pendingRequest, ...rest } = user.subscription;
  await updateUser(userId, { subscription: rest });
  return NextResponse.json({ ok: true });
}
