// Passwords hashed with scrypt; sessions are random tokens stored in Postgres
// and referenced by an httpOnly, secure (in prod), SameSite=Lax cookie.
// Login/signup are rate-limited (see lib/rateLimit.js). Still missing:
// email verification, password reset — see DECISIONS.md.
import crypto from "crypto";
import { cookies } from "next/headers";
import { findSessionByToken, createSessionRow, deleteSession, findUserById, insertUser } from "./db";

const COOKIE = "wp_session";
const TRIAL_DAYS = 7;

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
export function verifyPassword(password, stored) {
  try {
    const [salt, hash] = stored.split(":");
    const test = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(test, "hex"));
  } catch {
    return false;
  }
}

export async function createUser({ name, email, password, language = "en" }) {
  const id = "u_" + crypto.randomBytes(8).toString("hex");
  const now = Date.now();
  const user = {
    id,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hashPassword(password),
    createdAt: now,
    language,
    theme: "light",
    children: [],
    subscription: {
      plan: "trial", // trial | monthly | yearly | expired
      trialEndsAt: now + TRIAL_DAYS * 24 * 60 * 60 * 1000,
      renewedAt: null,
    },
  };
  await insertUser(user);
  return user;
}

export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  await createSessionRow(token, userId);
  return token;
}
export async function destroySession(token) {
  await deleteSession(token);
}

export async function getSessionUser() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  const sess = await findSessionByToken(token);
  if (!sess) return null;
  return findUserById(sess.userId);
}

export function setSessionCookie(token) {
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
export async function clearSessionCookie() {
  const token = cookies().get(COOKIE)?.value;
  if (token) await destroySession(token);
  cookies().delete(COOKIE);
}

export function subscriptionStatus(user) {
  const sub = user.subscription || {};
  if (sub.plan === "monthly" || sub.plan === "yearly") return { active: true, plan: sub.plan, daysLeft: null };
  const msLeft = (sub.trialEndsAt || 0) - Date.now();
  if (msLeft > 0) return { active: true, plan: "trial", daysLeft: Math.ceil(msLeft / 86400000) };
  return { active: false, plan: "expired", daysLeft: 0 };
}

export function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return { ...rest, subscriptionStatus: subscriptionStatus(user) };
}
