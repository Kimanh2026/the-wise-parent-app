// Verifies "Sign in with Google" ID tokens (Google Identity Services button on
// the client). Only needs GOOGLE_CLIENT_ID — this is the lightweight ID-token
// flow, not the OAuth authorization-code flow, so no client secret or
// redirect URI is required. See DECISIONS.md for why this approach was chosen.
import { OAuth2Client } from "google-auth-library";

let client;
function getClient() {
  if (!client) client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  return client;
}

// Verifies the token's signature and audience against Google's public keys.
// Throws if the token is missing, expired, malformed, or issued for a
// different client ID (e.g. a token stolen from another site).
export async function verifyGoogleIdToken(idToken) {
  const ticket = await getClient().verifyIdToken({
    idToken,
    audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email || !payload?.sub) throw new Error("Google token missing required claims");
  return {
    googleSub: payload.sub,
    email: payload.email,
    emailVerified: payload.email_verified !== false,
    name: payload.name || payload.email.split("@")[0],
  };
}
