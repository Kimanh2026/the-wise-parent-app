// Single shared-secret admin login (ADMIN_SECRET) — not a second user role,
// just gates the /admin dashboard used to confirm manual PayPal/Zalo
// payments. Stateless: the session cookie is an HMAC-signed token keyed off
// ADMIN_SECRET itself, so no extra DB table is needed.
import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE = "wp_admin";
const MAX_AGE = 60 * 60 * 8; // 8 hours

function sign(payload) {
  return crypto.createHmac("sha256", process.env.ADMIN_SECRET || "").update(payload).digest("hex");
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_SECRET);
}

export function checkAdminSecret(secret) {
  if (!adminConfigured() || !secret) return false;
  const a = Buffer.from(String(secret));
  const b = Buffer.from(process.env.ADMIN_SECRET);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function setAdminCookie() {
  const exp = Date.now() + MAX_AGE * 1000;
  const token = `${exp}.${sign(String(exp))}`;
  // Scoped to path "/" (not "/admin") so it's actually sent to the
  // /api/admin/* routes it guards — a narrower path here has bitten this
  // app before (see APP_STATUS notes on the original cookie-scope bug).
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearAdminCookie() {
  cookies().delete(COOKIE);
}

export function isAdmin() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return false;
  const [exp, mac] = token.split(".");
  if (!exp || !mac || Date.now() > Number(exp)) return false;
  const expected = sign(exp);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
