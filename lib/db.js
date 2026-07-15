// Postgres-backed storage. Tables are created on first connection (idempotent).
import { Pool } from "pg";

let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
      ssl: /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || process.env.POSTGRES_URL || "") ? false : { rejectUnauthorized: false },
    });
  }
  return pool;
}

let readyPromise;
function ready() {
  if (!readyPromise) {
    readyPromise = getPool().query(`
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
  }
  return readyPromise;
}

function rowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: Number(row.created_at),
    language: row.language,
    theme: row.theme,
    children: row.children,
    subscription: row.subscription,
  };
}

// ---- Users ----
export async function findUserByEmail(email) {
  await ready();
  const { rows } = await getPool().query("SELECT * FROM users WHERE lower(email) = lower($1)", [String(email)]);
  return rowToUser(rows[0]);
}
export async function findUserById(id) {
  await ready();
  const { rows } = await getPool().query("SELECT * FROM users WHERE id = $1", [id]);
  return rowToUser(rows[0]);
}
export async function insertUser(user) {
  await ready();
  await getPool().query(
    `INSERT INTO users (id, name, email, password_hash, created_at, language, theme, children, subscription)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      user.id,
      user.name,
      user.email,
      user.passwordHash,
      user.createdAt,
      user.language,
      user.theme,
      JSON.stringify(user.children),
      JSON.stringify(user.subscription),
    ]
  );
  return user;
}
export async function updateUser(id, patch) {
  await ready();
  const existing = await findUserById(id);
  if (!existing) return null;
  const next = { ...existing, ...patch };
  await getPool().query(
    `UPDATE users SET name = $2, language = $3, theme = $4, children = $5, subscription = $6 WHERE id = $1`,
    [id, next.name, next.language, next.theme, JSON.stringify(next.children), JSON.stringify(next.subscription)]
  );
  return next;
}

// ---- Sessions ----
export async function createSessionRow(token, userId) {
  await ready();
  await getPool().query("INSERT INTO sessions (token, user_id, created_at) VALUES ($1, $2, $3)", [token, userId, Date.now()]);
}
export async function findSessionByToken(token) {
  await ready();
  const { rows } = await getPool().query("SELECT user_id FROM sessions WHERE token = $1", [token]);
  return rows[0] ? { userId: rows[0].user_id } : null;
}
export async function deleteSession(token) {
  await ready();
  await getPool().query("DELETE FROM sessions WHERE token = $1", [token]);
}

// ---- Per-user app state (progress, toolkit, chat, favorites) ----
const DEFAULT_STATE = {
  streak: { count: 0, lastDay: null, best: 0 },
  missions: {}, // dateKey -> true
  savedStories: [],
  favoriteLessons: [],
  storyReflections: {}, // storyId -> text
  reset: { startedAt: null, completedDays: [], notes: {} },
  toolkit: {
    rules: [],
    routine: [],
    rewards: { childName: "", goal: "", stars: 0, target: 20, log: [] },
    screen: {}, // dateKey -> minutes
    emotions: [], // {date, child, feeling, note}
  },
  coachHistory: [],
};

export async function getUserState(userId) {
  await ready();
  const { rows } = await getPool().query("SELECT state FROM user_state WHERE user_id = $1", [userId]);
  const state = rows[0]?.state || null;
  if (!state) return structuredClone(DEFAULT_STATE);
  // merge to tolerate older records
  return { ...structuredClone(DEFAULT_STATE), ...state, toolkit: { ...structuredClone(DEFAULT_STATE.toolkit), ...(state.toolkit || {}) } };
}
export async function saveUserState(userId, state) {
  await ready();
  await getPool().query(
    `INSERT INTO user_state (user_id, state) VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET state = EXCLUDED.state`,
    [userId, JSON.stringify(state)]
  );
}
