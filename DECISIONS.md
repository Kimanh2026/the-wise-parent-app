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

## 7. Demo-grade auth — still not fully production-hardened
scrypt-hashed passwords, random session tokens, httpOnly cookie, now stored in Postgres instead of a JSON file. Still missing on purpose for this beta: rate limiting, CSRF tokens, email verification, password reset, secure-cookie flag behind TLS. These are the first items to add before charging real money.

## 8. Subscription is a real flow with a demo checkout
Trial (7 days, timestamp on the user record) → expiry computed on every request → non-active users hit a paywall on app pages and a 402 on the coach API. "Checkout" activates the plan instantly and says so on the page ("Demo checkout — no real payment is made"). Rationale: validates the full monetization UX without pretending to process cards. Stripe can slot into `POST /api/subscribe` later.

## 9. Content rotates by date, not randomness
Story, tip, and mission of the day are selected by `floor(now / 86400000) % length`. Every user sees the same "today" content, it never repeats within a cycle, and it's deterministic for testing. Streaks count consecutive days on which the daily mission was completed.

## 10. Sequential unlock in the 7-Day Reset
Days unlock one at a time. Behavioral rationale: completion of small commitments beats buffet-style browsing; it also creates a natural daily return loop.

## 11. Printables via print CSS, not PDF generation
`/toolkit/print/[tool]` pages are print-styled (sidebar/nav hidden, clean tables, blank rows when data is empty so sheets work as paper forms). Browser Print → Save as PDF replaces a server-side PDF library — one less dependency, identical result for home printing.

## 12. Bilingual as data, not translation layer
All content (stories, library, reset days, tips, coach fallbacks) is authored in both English and Vietnamese side by side (`{ en: {...}, vi: {...} }`), and the UI dictionary lives in `lib/i18n.js`. Language is a per-user setting and also affects the live coach's reply language.
