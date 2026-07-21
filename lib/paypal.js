// PayPal REST API — real recurring subscriptions with auto-activation via
// webhook. Built as an alternative to Stripe: as of 2026, Stripe does not
// support opening an account from Vietnam (stripe.com/global), so it can't
// be used to actually receive payouts here. PayPal does.
//
// Needs a PayPal BUSINESS account (Subscriptions isn't available to
// personal accounts) and two things set up once in the PayPal dashboard —
// see .env.example for the exact steps:
//   1. An app under developer.paypal.com → Apps & Credentials, for the
//      Client ID (public, safe in client-side JS) and Client Secret.
//   2. Two Subscription Plans (monthly, yearly) — their Plan IDs.
//   3. A webhook pointed at /api/webhooks/paypal — its Webhook ID.
//
// All five values live in env vars; nothing here is hardcoded, so the app
// works exactly as before (manual PayPal.me + Zalo) until they're set.

const BASE = process.env.PAYPAL_ENV === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";

export function paypalConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID &&
      process.env.PAYPAL_CLIENT_SECRET &&
      process.env.PAYPAL_WEBHOOK_ID &&
      process.env.NEXT_PUBLIC_PAYPAL_PLAN_MONTHLY &&
      process.env.NEXT_PUBLIC_PAYPAL_PLAN_YEARLY
  );
}

// Cached across warm serverless invocations; harmless to refetch on a cold
// start. PayPal client-credential tokens are short-lived (a few hours).
let cachedToken = null;
async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) return cachedToken.token;
  const auth = Buffer.from(`${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("paypal_auth_failed");
  const data = await res.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

export async function paypalApi(path, { method = "GET", body } = {}) {
  const token = await getAccessToken();
  return fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function planForId(planId) {
  return planId === process.env.NEXT_PUBLIC_PAYPAL_PLAN_YEARLY ? "yearly" : "monthly";
}

// Confirms a webhook actually came from PayPal (not forged) before we ever
// trust it to activate a paid plan — the same category of bug as the
// demo-checkout issue this app already hit once, so this must not be
// skipped. Uses PayPal's own "postback" verification endpoint rather than
// hand-rolling the CRC32/RSA check.
export async function verifyWebhookSignature(headers, webhookEvent) {
  const body = {
    transmission_id: headers.get("paypal-transmission-id"),
    transmission_time: headers.get("paypal-transmission-time"),
    cert_url: headers.get("paypal-cert-url"),
    auth_algo: headers.get("paypal-auth-algo"),
    transmission_sig: headers.get("paypal-transmission-sig"),
    webhook_id: process.env.PAYPAL_WEBHOOK_ID,
    webhook_event: webhookEvent,
  };
  if (!body.transmission_id || !body.transmission_sig || !body.cert_url) return false;
  const res = await paypalApi("/v1/notifications/verify-webhook-signature", { method: "POST", body });
  if (!res.ok) return false;
  const data = await res.json();
  return data.verification_status === "SUCCESS";
}
