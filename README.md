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
| Pricing | `/pricing` | Trial 7 days → Monthly $9.99 or Yearly $79.99. Demo checkout — no real payment |

## Data & auth

- All data lives in Postgres (`DATABASE_URL`): `users`, `sessions`, `user_state` tables. Tables are created automatically on first connection — no manual migration step.
- Passwords are scrypt-hashed. Sessions use an httpOnly cookie referencing a row in `sessions`.
- Still not fully hardened for production: no rate limiting, CSRF tokens, email verification, or password reset yet — see DECISIONS.md before charging real money.

## Languages & themes

Full English and Vietnamese UI plus fully bilingual content (stories, library, reset program, coach). Light and dark themes. Both are per-user settings and also work pre-login via localStorage.

## Scripts

- `npm run dev` — development server (port 3000)
- `npm run build` / `npm start` — production
- `npm run seed` — (re)create the demo account
