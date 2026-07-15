// Lightweight abuse protection for auth + AI endpoints.
// Netlify Functions are stateless between invocations, so counters live in
// Postgres (already the app's datastore) rather than in-memory.
import { headers } from "next/headers";
import { checkRateLimit } from "./db";

export function clientIp() {
  const h = headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") || h.get("cf-connecting-ip") || "unknown";
}

// Returns true when the request should be BLOCKED (limit exceeded).
export async function isRateLimited(routeKey, identity, { limit, windowMs }) {
  const key = `${routeKey}:${identity}`;
  const withinLimit = await checkRateLimit(key, limit, windowMs);
  return !withinLimit;
}
