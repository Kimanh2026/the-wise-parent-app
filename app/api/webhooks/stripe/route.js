import { NextResponse } from "next/server";
import { getStripe, planForPriceId } from "@/lib/stripe";
import { findUserById, updateUser } from "@/lib/db";

// Stripe requires the raw request body for signature verification, so this
// reads req.text() rather than req.json(). Subscription state is driven
// entirely by these events (not by the checkout success redirect, which a
// user could close the tab before reaching, or which could be replayed).
export async function POST(req) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "not_configured" }, { status: 400 });

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `signature: ${err.message}` }, { status: 400 });
  }

  const sub = event.data.object;

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const userId = sub.metadata?.userId;
    if (userId) {
      const user = await findUserById(userId);
      if (user) {
        const plan = sub.metadata?.plan || planForPriceId(sub.items?.data?.[0]?.price?.id);
        const active = ["active", "trialing"].includes(sub.status);
        await updateUser(userId, {
          subscription: {
            ...user.subscription,
            plan: active ? plan : user.subscription.plan,
            renewedAt: active ? Date.now() : user.subscription.renewedAt,
            stripeCustomerId: sub.customer,
            stripeSubscriptionId: sub.id,
            stripeStatus: sub.status, // active | trialing | past_due | unpaid | canceled…
          },
        });
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const userId = sub.metadata?.userId;
    if (userId) {
      const user = await findUserById(userId);
      if (user) {
        await updateUser(userId, {
          subscription: { ...user.subscription, plan: "expired", stripeStatus: "canceled" },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
