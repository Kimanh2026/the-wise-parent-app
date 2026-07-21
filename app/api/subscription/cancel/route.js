import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { updateUser } from "@/lib/db";
import { verifyCsrf } from "@/lib/csrf";
import { notifyAdminOfCancellation } from "@/lib/notify";

// Self-service cancel for plans that were activated WITHOUT a real Stripe
// subscription behind them (admin-activated PayPal/Zalo payments — that's
// every paid account right now, see app/api/checkout's production guard).
// A real Stripe subscription must be cancelled through the Billing Portal
// (app/api/billing-portal) instead, so it goes through Stripe's own
// proration/refund rules rather than this route.
//
// Takes effect immediately (access stops now) — there's no billing-cycle
// end date tracked for manually-activated plans to defer to.
export async function POST(req) {
  if (!verifyCsrf(req)) return NextResponse.json({ error: "csrf" }, { status: 403 });

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (user.subscription?.stripeCustomerId) {
    return NextResponse.json({ error: "use_billing_portal" }, { status: 400 });
  }

  const plan = user.subscription?.plan;
  if (plan !== "monthly" && plan !== "yearly") {
    return NextResponse.json({ error: "nothing_to_cancel" }, { status: 400 });
  }

  await updateUser(user.id, {
    subscription: { plan: "trial", trialEndsAt: Date.now() - 1, renewedAt: null },
  });
  await notifyAdminOfCancellation(user, plan);

  return NextResponse.json({ ok: true });
}
