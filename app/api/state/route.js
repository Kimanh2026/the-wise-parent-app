import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getUserState, saveUserState } from "@/lib/db";

// Shallow-merges a patch into the user app state (toolkit merged one level deeper).
export async function PATCH(req) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const patch = await req.json().catch(() => ({}));
  const state = await getUserState(user.id);
  const next = { ...state, ...patch };
  if (patch.toolkit) next.toolkit = { ...state.toolkit, ...patch.toolkit };
  await saveUserState(user.id, next);
  return NextResponse.json({ state: next });
}
