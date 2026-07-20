import { NextResponse } from "next/server";
import { getSessionUser, publicUser } from "@/lib/auth";
import { updateUser } from "@/lib/db";
import { getStripe, stripeConfigured, priceIdFor } from "@/lib/stripe";

// Real Stripe Checkout when STRIPE_* env vars are set; otherwise the
// original instant demo activation, so the app is fully testable with zero
// payment setup. Subscription state after a real checkout is driven by the
// webhook (app/api/webhooks/stripe), not by this route or the redirect.
export async function POST(req) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { plan } = await req.json().catch(() => ({}));
  if (!["monthly", "yearly"].includes(plan)) {
    return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
  }

  if (!stripeConfigured()) {
    const updated = await updateUser(user.id, {
      subscription: { ...user.subscription, plan, renewedAt: Date.now() },
    });
    return NextResponse.json({ demo: true, user: publicUser(updated) });
  }

  const origin = req.headers.get("origin") || new URL(req.url).origin;
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceIdFor(plan), quantity: 1 }],
    customer_email: user.email,
    client_reference_id: user.id,
    subscription_data: { metadata: { userId: user.id, plan } },
    success_url: `${origin}/pricing?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=cancelled`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
