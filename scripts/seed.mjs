// Seeds the demo account (demo@wiseparent.app / demo1234) with realistic data.
// Run: node scripts/seed.mjs   (safe to re-run; overwrites only the demo user)
import crypto from "crypto";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || process.env.POSTGRES_URL || "") ? false : { rejectUnauthorized: false },
});

await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    theme TEXT NOT NULL DEFAULT 'light',
    children JSONB NOT NULL DEFAULT '[]',
    subscription JSONB NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at BIGINT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS user_state (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    state JSONB NOT NULL
  );
`);

const salt = crypto.randomBytes(16).toString("hex");
const passwordHash = `${salt}:${crypto.scryptSync("demo1234", salt, 64).toString("hex")}`;

const day = 86400000;
const now = Date.now();
const iso = (offset) => new Date(now - offset * day).toISOString().slice(0, 10);

const demo = {
  id: "u_demo0001",
  name: "Sarah Nguyen",
  email: "demo@wiseparent.app",
  passwordHash,
  createdAt: now - 3 * day,
  language: "en",
  theme: "light",
  children: [
    { name: "Liam", age: 7 },
    { name: "Chloe", age: 11 },
  ],
  subscription: { plan: "yearly", trialEndsAt: null, renewedAt: now },
};

await pool.query(
  `INSERT INTO users (id, name, email, password_hash, created_at, language, theme, children, subscription)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
   ON CONFLICT (email) DO UPDATE SET
     name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, created_at = EXCLUDED.created_at,
     language = EXCLUDED.language, theme = EXCLUDED.theme, children = EXCLUDED.children, subscription = EXCLUDED.subscription`,
  [demo.id, demo.name, demo.email, demo.passwordHash, demo.createdAt, demo.language, demo.theme, JSON.stringify(demo.children), JSON.stringify(demo.subscription)]
);

const state = {
  streak: { count: 3, lastDay: iso(0), best: 3 },
  missions: { [iso(2)]: true, [iso(1)]: true, [iso(0)]: true },
  savedStories: ["tea-kettle", "cracked-pot"],
  favoriteLessons: ["screen-addiction", "gratitude"],
  storyReflections: {
    "tea-kettle": "I rush Liam every morning. Tomorrow I'll try waiting ten extra seconds before repeating myself.",
  },
  reset: {
    startedAt: now - 2 * day,
    completedDays: [1, 2],
    notes: {
      1: "Quiet coffee before the kids woke up. Calmer school run than usual.",
      2: "Chloe talked for 5 whole minutes about her friend drama. I just listened.",
    },
  },
  toolkit: {
    rules: [
      "We speak kindly, even when upset",
      "Screens rest during meals — everyone's",
      "We fix what we break, together",
    ],
    routine: [
      { time: "07:00", activity: "Wake up, open curtains, hugs", who: "Everyone" },
      { time: "07:30", activity: "Breakfast together — no screens", who: "Everyone" },
      { time: "17:30", activity: "Homework + reading time", who: "Liam & Chloe" },
      { time: "19:30", activity: "Bath, pyjamas, one story", who: "Liam" },
      { time: "20:30", activity: "Lights out, gratitude sentence", who: "Everyone" },
    ],
    rewards: {
      childName: "Liam",
      goal: "Calm goodbyes at screen-off time",
      stars: 8,
      target: 20,
      log: [],
    },
    screen: {
      [iso(6)]: 120, [iso(5)]: 90, [iso(4)]: 105, [iso(3)]: 75,
      [iso(2)]: 60, [iso(1)]: 60, [iso(0)]: 45,
    },
    emotions: [
      { date: iso(0), child: "Liam", feeling: "Frustrated", note: "Tablet time ended — deep breaths together helped" },
      { date: iso(1), child: "Chloe", feeling: "Proud", note: "Finished her science project by herself" },
      { date: iso(2), child: "Liam", feeling: "Scared", note: "Bad dream — sat with him, night light on" },
    ],
  },
  coachHistory: [
    { role: "user", content: "My 7-year-old melts down every time screen time ends. What can I do?" },
    {
      role: "assistant",
      content:
        "That moment is genuinely hard — for him and for you. His brain is mid-reward when the screen goes dark, so the crash is chemistry, not defiance.\n\nWhat helps most is a soft landing instead of a cliff: a 5-minute warning, then a 1-minute warning, then you arriving next to him (not calling from another room) as time ends.\n\nAncient wisdom says the calm parent is the lesson. Your steady voice teaches more than any rule.\n\nTonight, try this: 10 minutes before screens end, tell Liam what comes *after* — \"then it's snack and you can tell me about your game.\" Giving his brain something to move toward softens the goodbye.",
    },
  ],
};

await pool.query(
  `INSERT INTO user_state (user_id, state) VALUES ($1, $2)
   ON CONFLICT (user_id) DO UPDATE SET state = EXCLUDED.state`,
  [demo.id, JSON.stringify(state)]
);

console.log("Seeded demo user:", demo.email, "(password: demo1234)");
await pool.end();
