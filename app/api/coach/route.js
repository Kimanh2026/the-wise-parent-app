import { NextResponse } from "next/server";
import { getSessionUser, subscriptionStatus } from "@/lib/auth";
import { getUserState, saveUserState } from "@/lib/db";
import { askCoach, hasApiKey } from "@/lib/anthropic";

export async function POST(req) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!subscriptionStatus(user).active) {
    return NextResponse.json({ error: "subscription_required" }, { status: 402 });
  }
  const { messages } = await req.json().catch(() => ({}));
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "missing_messages" }, { status: 400 });
  }
  const clean = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  const result = await askCoach({
    messages: clean,
    language: user.language || "en",
    children: user.children || [],
  });

  const state = await getUserState(user.id);
  state.coachHistory = [...clean, { role: "assistant", content: result.text }].slice(-40);
  await saveUserState(user.id, state);

  return NextResponse.json({ text: result.text, source: result.source, notice: result.notice || null });
}

export async function GET() {
  return NextResponse.json({ live: hasApiKey() });
}
