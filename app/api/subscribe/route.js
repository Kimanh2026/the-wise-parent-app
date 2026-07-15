import { NextResponse } from "next/server";
import { getSessionUser, publicUser } from "@/lib/auth";
import { updateUser } from "@/lib/db";

// Demo checkout: activates a plan instantly. No real payment integration yet.
export async function POST(req) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { plan } = await req.json().catch(() => ({}));
  if (!["monthly", "yearly"].includes(plan)) {
    return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
  }
  const updated = await updateUser(user.id, {
    subscription: { ...user.subscription, plan, renewedAt: Date.now() },
  });
  return NextResponse.json({ user: publicUser(updated) });
}
