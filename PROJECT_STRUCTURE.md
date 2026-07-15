# Project structure

```
wise-parent/
├── app/
│   ├── layout.js                  # Root layout, theme bootstrap, Providers
│   ├── globals.css                # Full design system (tokens, components, print, dark mode)
│   ├── page.js                    # Marketing landing page
│   ├── login/page.js              # Log in
│   ├── signup/page.js             # Sign up (starts 7-day trial)
│   ├── pricing/page.js            # Plans, demo checkout, confirm modal
│   ├── (app)/                     # Authenticated area (wrapped in AppShell)
│   │   ├── layout.js
│   │   ├── home/page.js           # Daily hub: story, tip, mission, streak, coach quick-ask
│   │   ├── coach/page.js          # AI Coach chat
│   │   ├── stories/page.js        # Story list
│   │   ├── stories/[id]/page.js   # Story reader: wisdom, science, action, reflection
│   │   ├── library/page.js        # Guide list
│   │   ├── library/[slug]/page.js # Guide reader: key ideas, phrases, favorite
│   │   ├── toolkit/page.js        # 5 tools in tabs (rules, routine, rewards, screen, emotions)
│   │   ├── toolkit/print/[tool]/page.js  # Printable sheets (Print → Save as PDF)
│   │   ├── reset/page.js          # 7-Day Family Reset, sequential unlock
│   │   ├── progress/page.js       # Stats, saved stories, favorite lessons
│   │   └── settings/page.js       # Language, theme, profile, children, plan, AI status
│   └── api/
│       ├── auth/signup|login|logout/route.js
│       ├── me/route.js            # Current user + app state
│       ├── user/route.js          # PATCH profile/settings
│       ├── state/route.js         # PATCH per-user app state
│       ├── subscribe/route.js     # Demo checkout
│       └── coach/route.js         # POST chat (auth + active plan required); GET AI status
├── components/
│   ├── Providers.js               # Client context: user, state, lang, theme, t()
│   ├── AppShell.js                # Sidebar, mobile bottom bar, trial banner, paywall
│   ├── AuthForm.js                # Shared login/signup form
│   └── Enso.js                    # Signature ensō logo
├── content/                       # All bilingual content as data
│   ├── stories.js                 # 7 stories + daily rotation
│   ├── tips.js                    # Daily tips + missions + dateKey()
│   ├── library.js                 # 8 parenting guides
│   └── reset.js                   # 7-Day Reset program
├── lib/
│   ├── db.js                      # JSON storage, atomic writes, user state defaults
│   ├── auth.js                    # scrypt hashing, sessions, trial/subscription status
│   ├── anthropic.js               # Live coach call (claude-sonnet-5) + fallback switch
│   ├── fallbackCoach.js           # Offline Wisdom Guide replies (EN/VI, keyword-routed)
│   └── i18n.js                    # UI dictionaries (EN/VI)
├── scripts/seed.mjs               # Demo account + realistic data (npm run seed)
├── data/                          # Runtime JSON data (users, sessions, userdata/)
├── README.md · DECISIONS.md · PROJECT_STRUCTURE.md
└── .env.example                   # ANTHROPIC_API_KEY template
```

Data flow: pages call `useApp()` (Providers) → optimistic UI update → `PATCH /api/state` → JSON file. Auth is a cookie session resolved server-side in every API route. Content never touches the network — it ships as code.
