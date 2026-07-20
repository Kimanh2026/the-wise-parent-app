import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { updateUser } from "@/lib/db";
import { verifyCsrf } from "@/lib/csrf";
import { notifyAdminOfPendingPayment } from "@/lib/notify";

// Customer clicked "I've paid" after using the PayPal.me link or Zalo QR on
// Pricing. Neither has a webhook, so this just flags the account for the
// owner to confirm at /admin — see lib/db.js listPendingPaymentRequests.
export async function POST(req) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!verifyCsrf(req)) return NextResponse.json({ error: "csrf" }, { status: 403 });

  const { plan, method } = await req.json().catch(() => ({}));
  if (!["monthly", "yearly"].includes(plan) || !["paypal", "zalo"].includes(method)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  await updateUser(user.id, {
    subscription: {
      ...user.subscription,
      pendingRequest: { plan, method, requestedAt: Date.now() },
    },
  });

  await notifyAdminOfPendingPayment(user, plan, method);

  return NextResponse.json({ ok: true });
}
