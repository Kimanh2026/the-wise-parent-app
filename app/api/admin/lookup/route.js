import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { findUserByEmail } from "@/lib/db";
import { publicUser } from "@/lib/auth";

// Manual "activate by email" lookup — for customers who message Zalo
// directly without using the in-app "I've paid" button.
export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { email } = await req.json().catch(() => ({}));
  if (!email) return NextResponse.json({ error: "missing" }, { status: 400 });
  const user = await findUserByEmail(email);
  if (!user) return NextResponse.json({ found: false });
  return NextResponse.json({ found: true, user: publicUser(user) });
}
