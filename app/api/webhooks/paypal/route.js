import { NextResponse } from "next/server";
import { paypalConfigured, verifyWebhookSignature, planForId } from "@/lib/paypal";
import { findUserById, updateUser } from "@/lib/db";

// Source of truth for PayPal subscription state — mirrors app/api/webhooks/
// stripe. The client-side "subscribe" button (components/PayPalButton.js)
// only shows an optimistic "processing" state; it must NEVER activate a
// plan by itself, since a client callback can be faked. Only a
// signature-verified webhook event is trusted to grant access.
export async function POST(req) {
  if (!paypalConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 400 });

  const raw = await req.text();
  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const verified = await verifyWebhookSignature(req.headers, event).catch(() => false);
  if (!verified) return NextResponse.json({ error: "invalid_signature" }, { status: 400 });

  const resource = event.resource || {};
  // Set client-side when the subscription is created (see PayPalButton's
  // createSubscription call) — this is how we map a PayPal subscription
  // back to our own user id, the same role client_reference_id plays for
  // Stripe checkout.
  const userId = resource.custom_id;

  if (event.event_type === "BILLING.SUBSCRIPTION.ACTIVATED" && userId) {
    const user = await findUserById(userId);
    if (user) {
      await updateUser(userId, {
        subscription: {
          ...user.subscription,
          plan: planForId(resource.plan_id),
          renewedAt: Date.now(),
          paypalSubscriptionId: resource.id,
          paypalStatus: "active",
        },
      });
    }
  }

  const DOWNGRADE_EVENTS = ["BILLING.SUBSCRIPTION.CANCELLED", "BILLING.SUBSCRIPTION.EXPIRED", "BILLING.SUBSCRIPTION.SUSPENDED"];
  if (DOWNGRADE_EVENTS.includes(event.event_type) && userId) {
    const user = await findUserById(userId);
    if (user) {
      await updateUser(userId, {
        subscription: { ...user.subscription, plan: "expired", paypalStatus: event.event_type.split(".").pop().toLowerCase() },
      });
    }
  }

  return NextResponse.json({ received: true });
}
