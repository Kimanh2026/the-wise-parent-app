import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { updateUser } from "@/lib/db";
import { verifyCsrf } from "@/lib/csrf";
import { notifyAdminOfCancellation } from "@/lib/notify";
import { paypalConfigured, paypalApi } from "@/lib/paypal";

// Self-service cancel. A real Stripe subscription must be cancelled through
// the Billing Portal (app/api/billing-portal) instead, so it goes through
// Stripe's own proration/refund rules rather than this route.
//
// For a real PayPal subscription, this calls PayPal's own cancel endpoint
// FIRST — downgrading the account locally without also telling PayPal would
// leave the recurring billing running in the background, so the customer
// keeps getting charged after "cancelling". Admin-activated (Zalo/manual)
// plans have no billing to stop, so they just downgrade locally.
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

  const paypalSubId = user.subscription?.paypalSubscriptionId;
  if (paypalSubId && paypalConfigured()) {
    const res = await paypalApi(`/v1/billing/subscriptions/${paypalSubId}/cancel`, {
      method: "POST",
      body: { reason: "Cancelled by customer from Settings" },
    }).catch(() => null);
    // 204 = cancelled; 422/404 usually means PayPal already considers it
    // inactive (e.g. a prior failed-payment auto-cancel) — either way it's
    // safe to downgrade locally. A network/auth failure is the only case
    // worth stopping for, so the customer isn't told "cancelled" while
    // PayPal is still billing them.
    if (!res) {
      return NextResponse.json({ error: "paypal_cancel_failed" }, { status: 502 });
    }
  }

  await updateUser(user.id, {
    subscription: { plan: "trial", trialEndsAt: Date.now() - 1, renewedAt: null },
  });
  await notifyAdminOfCancellation(user, plan);

  return NextResponse.json({ ok: true });
}
