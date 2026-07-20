// Stripe billing — optional. If STRIPE_SECRET_KEY / STRIPE_PRICE_MONTHLY /
// STRIPE_PRICE_YEARLY aren't set, app/api/checkout/route.js falls back to the
// original instant demo activation, so the app stays fully testable with
// zero payment setup (see README for the real setup steps).
import Stripe from "stripe";

let stripe;
export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!stripe) stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
  return stripe;
}

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_MONTHLY && process.env.STRIPE_PRICE_YEARLY);
}

export function priceIdFor(plan) {
  return plan === "yearly" ? process.env.STRIPE_PRICE_YEARLY : process.env.STRIPE_PRICE_MONTHLY;
}

export function planForPriceId(priceId) {
  return priceId === process.env.STRIPE_PRICE_YEARLY ? "yearly" : "monthly";
}
