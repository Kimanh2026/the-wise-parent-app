import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { listPendingPaymentRequests } from "@/lib/db";
import { publicUser } from "@/lib/auth";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const users = await listPendingPaymentRequests();
  return NextResponse.json({ requests: users.map(publicUser) });
}
