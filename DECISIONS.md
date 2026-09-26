# Decisions

Product and engineering decisions made during the autonomous build, with reasoning and trade-offs.

## 1. JavaScript, not TypeScript
The spec asked for a fast, self-contained local app. Plain JS removes a build-config layer and keeps every file readable for a non-developer owner. Trade-off: no compile-time type safety. Mitigation: small surface area, consistent data shapes defined in one place (`lib/db.js` DEFAULT_STATE).

## 2. Custom CSS design system, no Tailwind
A single `globals.css` with design tokens (CSS variables) gives full control of the brand feel and works offline with zero dependencies. Trade-off: no utility-class velocity. For an app this size, one stylesheet is easier to maintain than a Tailwind pipeline.

## 3. System font stacks instead of web fonts
`fonts.googleapis.com` is blocked in the build environment, and self-hosting fonts adds weight. Chosen stacks: display serif "Iowan Old Style / Palatino / Georgia" (warm, book-like — fits the wisdom brand), body "Avenir Next / Segoe UI / system-ui". Result: zero font network requests, instant text render, still distinctive.

## 4. Signature visual element: the ensō ring
One memorable mark used consistently (logo, auth screens, paywall, print headers): a hand-drawn-style ensō circle in pine green with a lantern-amber dot. Palette: pine `#2e5c4e`, lantern amber `#c9862e`, sage-mist paper background. Deliberately avoids the generic "AI-startup gradient" look.

## 5. AI Coach: server-side key + graceful fallback
- The Anthropic key is read from `ANTHROPIC_API_KEY` on the server only. Users never enter a key (verified: keyless calls return 401, so key presence is checked before calling).
- When no key is configured or the API errors/times out (30 s), the app answers from a built-in "Wisdom Guide": curated bilingual replies keyword-routed by topic (screens/gaming, anger, respect, sleep, gratitude, generic). Each follows the same coaching contract as the live prompt — warm tone, brief science, one line of wisdom, exactly one "Tonight, try this:" action.
- The UI labels fallback answers honestly and points to Settings → About. No fake "AI is thinking" theatre around canned answers beyond a normal loading state.
- Model for live mode: `claude-sonnet-5` — best quality/cost balance for short coaching replies.

## 6. Postgres storage (moved off JSON files for public deployment)
`/data/*.json` was right-sized for a local, single-machine demo but has no place on a serverless host (Vercel/Netlify functions have an ephemeral filesystem — writes wouldn't persist) and had a lost-update race on `users.json` under concurrent signups. Moved to three Postgres tables (`users`, `sessions`, `user_state`) behind the same `lib/db.js` function names, so `auth.js` and the API routes only needed `await` added, not rewritten. Tables are created with idempotent `CREATE TABLE IF NOT EXISTS` on first connection — no manual migration step.

## 7. Demo-grade auth — hardened, still not fully production-ready
scrypt-hashed passwords, random session tokens, httpOnly cookie, stored in Postgres instead of a JSON file.

Added for launch: session cookie now sets `secure: true` when `NODE_ENV=production` (HTTPS-only, matches Netlify); login/signup/coach are rate-limited via a Postgres-backed fixed-window counter keyed by IP (login) or user id (coach) — see `lib/rateLimit.js` and `checkRateLimit` in `lib/db.js`; login compares against a fixed dummy hash when the email doesn't exist, so a failed login takes about the same time whether or not the account exists (reduces email-enumeration via timing); signup validates email format and requires an 8-character password (was 6); `next.config.mjs` sends baseline security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS) on every route.

CSRF is not implemented as a separate token, and that's an intentional call, not an oversight: all mutating routes are JSON APIs read via `fetch` with a `SameSite=Lax` cookie, which browsers do not attach on cross-site non-navigation requests — the practical CSRF surface for this app is already small. Revisit if a route ever accepts `multipart/form-data` or a plain HTML form POST.

Still missing on purpose for this beta: email verification, password reset, per-account (not just per-IP) login throttling. These are the next items to add before charging real money — password reset in particular needs an email-sending provider (e.g. Resend) that isn't wired up yet.

## 8. Subscription flow built (trial → paywall → Stripe/PayPal), then turned off
Originally: 7-day trial → expiry computed on every request → non-active users hit a paywall on app pages and a 402 on the coach API, with real Stripe/PayPal checkout and a demo-checkout fallback. This full flow still exists in the code (`app/api/checkout`, `app/api/subscribe`, `app/api/webhooks/*`, `lib/stripe.js`, `lib/manualPayment.js`) but is no longer wired to anything — see #13.

## 9. Content rotates by date, not randomness
Story, tip, and mission of the day are selected by `floor(now / 86400000) % length`. Every user sees the same "today" content, it never repeats within a cycle, and it's deterministic for testing. Streaks count consecutive days on which the daily mission was completed.

## 10. Sequential unlock in the 7-Day Reset
Days unlock one at a time. Behavioral rationale: completion of small commitments beats buffet-style browsing; it also creates a natural daily return loop.

## 11. Printables via print CSS, not PDF generation
`/toolkit/print/[tool]` pages are print-styled (sidebar/nav hidden, clean tables, blank rows when data is empty so sheets work as paper forms). Browser Print → Save as PDF replaces a server-side PDF library — one less dependency, identical result for home printing.

## 12b. Google sign-in via ID-token flow, not full OAuth redirect / NextAuth
Chose Google Identity Services' client-side button + ID-token verification over (a) a full OAuth 2.0 authorization-code redirect flow or (b) pulling in NextAuth/Auth.js. Reasoning: the app only needs *identity* (who is this person), not access to any Google API on the user's behalf, so the lighter ID-token flow is sufficient and needs only a public Client ID — no client secret, no redirect URI configuration, no server-side token exchange. Adding NextAuth would have meant migrating the existing custom session/cookie system for one feature; instead Google sign-in plugs into the same `createSession`/`setSessionCookie` primitives email login already uses. Trade-off: if the app later needs to *act* on the user's Google account (e.g. Calendar), a real OAuth flow would be needed then — not before.

## 12. Bilingual as data, not translation layer
All content (stories, library, reset days, tips, coach fallbacks) is authored in both English and Vietnamese side by side (`{ en: {...}, vi: {...} }`), and the UI dictionary lives in `lib/i18n.js`. Language is a per-user setting and also affects the live coach's reply language.

## 13. App made fully free (paywall removed, password kept)
No real customer had ever paid at the point this changed, so there was nothing to migrate/refund. `subscriptionStatus()` in `lib/auth.js` now always returns `{ active: true }` — the trial countdown, the in-app paywall (`AppShell`'s old `Paywall` component), the 402 on `/api/coach`, and the Pricing/Settings plan UI are all removed or replaced with a simple "it's free" message. Payment infrastructure (Stripe, PayPal, manual/Zalo, `/admin` gift-granting) is intentionally left in the codebase but unreachable from any page, in case charging is reintroduced later.

Password sign-in was **kept** (a passwordless, email-only version was built and then explicitly reverted mid-session): the trade-off of "anyone who knows/guesses an email reads that account's data" was judged not worth the extra convenience once weighed against real accounts holding children's names/ages and AI Coach conversation history. Email+password (or Google sign-in) remains the only way in.
