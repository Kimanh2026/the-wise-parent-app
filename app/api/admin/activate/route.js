import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { verifyCsrf } from "@/lib/csrf";
import { findUserById, updateUser } from "@/lib/db";

// Activates a plan and clears any pending request. `plan` is optional when
// the user has a pendingRequest (we use its plan); it's required for the
// manual "activate by email" lookup flow, where there may be no pendingRequest
// at all (customer messaged Zalo directly without using the in-app button).
export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!verifyCsrf(req)) return NextResponse.json({ error: "csrf" }, { status: 403 });

  const { userId, plan: explicitPlan } = await req.json().catch(() => ({}));
  const user = await findUserById(userId);
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const plan = explicitPlan || user.subscription.pendingRequest?.plan;
  if (!["monthly", "yearly"].includes(plan)) {
    return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
  }

  const { pendingRequest, ...rest } = user.subscription;
  await updateUser(userId, { subscription: { ...rest, plan, renewedAt: Date.now() } });
  return NextResponse.json({ ok: true });
}
