import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { verifyCsrf } from "@/lib/csrf";
import { findUserById, updateUser } from "@/lib/db";

const TRIAL_DAYS = 7;

// Undoes a plan activation — for correcting a mistaken/demo activation, or
// any other case where an account's subscription needs to go back to a
// clean state. mode "trial" restarts a fresh 7-day trial; mode "expired"
// puts the account behind the paywall immediately. Drops any stripe/pending
// fields so a stale demo activation doesn't linger.
export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!verifyCsrf(req)) return NextResponse.json({ error: "csrf" }, { status: 403 });

  const { userId, mode } = await req.json().catch(() => ({}));
  if (!["trial", "expired"].includes(mode)) {
    return NextResponse.json({ error: "invalid_mode" }, { status: 400 });
  }
  const user = await findUserById(userId);
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const now = Date.now();
  const subscription =
    mode === "trial"
      ? { plan: "trial", trialEndsAt: now + TRIAL_DAYS * 24 * 60 * 60 * 1000, renewedAt: null }
      : { plan: "trial", trialEndsAt: now - 1, renewedAt: null };

  await updateUser(userId, { subscription });
  return NextResponse.json({ ok: true });
}
