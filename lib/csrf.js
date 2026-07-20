// Lightweight double-submit-cookie CSRF check for the new admin + manual-
// payment mutating routes. The pre-existing auth routes (login/signup/etc.)
// aren't covered — retrofitting those is a separate, larger change.
import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE = "wp_csrf";
const HEADER = "x-csrf-token";

export function issueCsrfToken() {
  const token = crypto.randomBytes(24).toString("hex");
  cookies().set(COOKIE, token, {
    httpOnly: false, // client JS must read it back to echo in the header
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 4,
  });
  return token;
}

export function verifyCsrf(req) {
  const cookieToken = cookies().get(COOKIE)?.value;
  const headerToken = req.headers.get(HEADER);
  return Boolean(cookieToken && headerToken && cookieToken === headerToken);
}
