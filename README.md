# The Wise Parent

AI Parenting Companion for parents of children aged 3–15, by Mind Peace Stories.
Ancient wisdom (Di Zi Gui, Master Hsuan Hua) + modern psychology and neuroscience, delivered as one small action a day.

## Quick start

```bash
npm install
cp .env.example .env.local   # set DATABASE_URL to a Postgres connection string
npm run seed     # creates the demo account (safe to re-run)
npm run dev      # http://localhost:3000
```

**Demo account:** `demo@wiseparent.app` / `demo1234` — pre-loaded with a 3-day streak, saved stories, family rules, a routine, a reward chart in progress, a week of screen data, and a coach conversation.

## Enabling the live AI Coach

The AI Coach works out of the box using a built-in offline "Wisdom Guide" (curated, rule-based replies). To enable live coaching:

1. Copy `.env.example` to `.env.local`
2. Set `GEMINI_API_KEY=...` — free tier, get a key in one click at https://aistudio.google.com/apikey (no billing required), **or** `ANTHROPIC_API_KEY=sk-ant-...` from console.anthropic.com (paid)
3. Restart the server

Gemini is tried first if both keys are set. Keys live only on the server — end users never see or enter one. If no key is configured or a provider errors, the app degrades gracefully to the Wisdom Guide and tells the user (Settings → About shows current AI status). Provider selection logic lives in `lib/coach.js`; curated grounding material (e.g. exported from NotebookLM) can be added in `lib/coachSources.js` to steer replies toward specific sources.

## What's inside

| Module | Route | Notes |
|---|---|---|
| Home | `/home` | Daily story, tip, mission (feeds streak), reset progress, coach quick-ask |
| AI Coach | `/coach` | Chat; history persisted; wisdom + science persona; one action per reply |
| Daily Stories | `/stories` | 7 original stories, rotate daily; save + personal reflection |
| Library | `/library` | 8 guides: screens, gaming, respect, gratitude, discipline, communication, emotions, confidence |
| Family Toolkit | `/toolkit` | Rules, routine planner, reward chart, screen tracker, emotion log — all printable (`/toolkit/print/[tool]`, use browser Print → Save as PDF) |
| 7-Day Reset | `/reset` | Sequential day unlock, notes per day |
| Progress | `/progress` | Streaks, missions, saved stories, favorite lessons |
| Settings | `/settings` | Language (EN/VI), theme, profile, children, subscription, AI status |
| Pricing | `/pricing` | Trial 7 days → Monthly $9.99 or Yearly $79.99. Real payment via Stripe or PayPal/Zalo if configured (see below), demo checkout otherwise |
| Admin | `/admin` | Owner-only dashboard to confirm manual PayPal/Zalo payments (needs `ADMIN_SECRET`) |

## Data & auth

- All data lives in Postgres (`DATABASE_URL`): `users`, `sessions`, `user_state` tables. Tables are created automatically on first connection — no manual migration step.
- Passwords are scrypt-hashed. Sessions use an httpOnly cookie referencing a row in `sessions`.
- Rate limiting is in place on login/signup/coach/admin-login. Not yet done: CSRF tokens on the original auth routes (the new admin + payment routes below have their own double-submit CSRF check), email verification, password reset — see DECISIONS.md before charging real money.

## Payments

Three ways a plan gets activated, in order of what's configured:

1. **Stripe (real card payments)** — set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY` (Price IDs from your Stripe Dashboard → Product catalog, one recurring price per plan). Checkout runs on Stripe's hosted page — no card data touches this app. Subscription state is driven by the `customer.subscription.*` webhook events, not the checkout redirect, so point a Stripe webhook endpoint at `/api/webhooks/stripe` (events: `customer.subscription.created`, `.updated`, `.deleted`). Users can self-manage/cancel via the Billing Portal button on Settings once they've paid once.
2. **PayPal / Zalo (manual)** — always available, needs zero configuration. Every plan on Pricing has an "Or pay via PayPal / bank transfer" option using the PayPal.me link and Zalo QR code in `lib/manualPayment.js` — **replace the placeholders there with your real link and QR image** (also swap `public/zalo-qr-placeholder.png`) before this goes live. Since these have no webhook, the customer clicking "I've paid" just flags their account for you to confirm at `/admin`.
3. **Demo checkout** — if none of the above apply, "Pay with card" activates the plan instantly with no real charge. This is what the app runs in from a fresh clone.

### `/admin` — confirming manual payments

Set `ADMIN_SECRET` (a password only you know) to enable `/admin`: a single-login dashboard (not a second user role) listing pending PayPal/Zalo requests with one-click Activate/Dismiss, plus a manual "activate by email" lookup for customers who pay via Zalo without clicking the in-app button. Optionally set `ADMIN_EMAIL` + `RESEND_API_KEY` to get an email ping whenever someone submits a request — without those, requests still show up in `/admin`, you just won't get notified.

## Languages & themes

Full English and Vietnamese UI plus fully bilingual content (stories, library, reset program, coach). Light and dark themes. Both are per-user settings and also work pre-login via localStorage.

## Scripts

- `npm run dev` — development server (port 3000)
- `npm run build` / `npm start` — production
- `npm run seed` — (re)create the demo account
