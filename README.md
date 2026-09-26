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
| Settings | `/settings` | Language (EN/VI), theme, profile, children, AI status |
| Pricing | `/pricing` | Informational only — the app is free, no plans to choose |
| Admin | `/admin` | Owner-only dashboard (needs `ADMIN_SECRET`) — dormant now that the app is free (see Payments below) |

## Data & auth

- All data lives in Postgres (`DATABASE_URL`): `users`, `sessions`, `user_state` tables. Tables are created automatically on first connection — no manual migration step.
- Passwords are scrypt-hashed. Sessions use an httpOnly cookie referencing a row in `sessions`.
- Rate limiting is in place on login/signup/coach/admin-login. Not yet done: CSRF tokens on the original auth routes (the admin + payment routes have their own double-submit CSRF check), email verification, password reset — see DECISIONS.md.

## Payments (dormant)

**The app is free for everyone — `lib/auth.js#subscriptionStatus` always returns active, no plan ever gates access.** This was a deliberate decision (see DECISIONS.md) once it became clear the app would be given away rather than sold. The Stripe/PayPal/manual-payment/`/admin` gift-granting code below still exists and still runs if you call it directly, but nothing in the UI links to it anymore — it's kept around in case charging is ever turned back on, not required for the app to work.

1. **Stripe (real card payments)** — `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY`. Webhook at `/api/webhooks/stripe`.
2. **PayPal / Zalo (manual)** — `lib/manualPayment.js`, confirmed via `/admin`.
3. **Demo checkout** — `/api/checkout` activates a plan instantly with no real charge.

### `/admin`

Set `ADMIN_SECRET` to enable `/admin` — still useful to look up a user by email, but the "Activate"/"Tặng miễn phí" buttons no longer change what a user can access, since everyone already has full access.

## Languages & themes

Full English and Vietnamese UI plus fully bilingual content (stories, library, reset program, coach). Light and dark themes. Both are per-user settings and also work pre-login via localStorage.

## Scripts

- `npm run dev` — development server (port 3000)
- `npm run build` / `npm start` — production
- `npm run seed` — (re)create the demo account
