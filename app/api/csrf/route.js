import { NextResponse } from "next/server";
import { issueCsrfToken } from "@/lib/csrf";

// Client fetches this once before a manual-payment or admin mutation to get
// a token to echo back in the x-csrf-token header (double-submit cookie).
export async function GET() {
  return NextResponse.json({ token: issueCsrfToken() });
}
