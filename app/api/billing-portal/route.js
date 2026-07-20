import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getStripe, stripeConfigured } from "@/lib/stripe";

// Self-serve plan management/cancellation via Stripe's hosted Billing
// Portal. Only available once a user has actually completed a real Stripe
// checkout (i.e. has a stripeCustomerId) — the demo flow has nothing to manage.
export async function POST(req) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const customerId = user.subscription?.stripeCustomerId;
  if (!stripeConfigured() || !customerId) {
    return NextResponse.json({ error: "not_available" }, { status: 400 });
  }
  const origin = req.headers.get("origin") || new URL(req.url).origin;
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/settings`,
  });
  return NextResponse.json({ url: session.url });
}
