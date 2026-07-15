import { NextResponse } from "next/server";
import { getSessionUser, publicUser } from "@/lib/auth";
import { updateUser } from "@/lib/db";

const ALLOWED = ["name", "language", "theme", "children"];

export async function PATCH(req) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const patch = {};
  for (const k of ALLOWED) if (k in body) patch[k] = body[k];
  const updated = await updateUser(user.id, patch);
  return NextResponse.json({ user: publicUser(updated) });
}
