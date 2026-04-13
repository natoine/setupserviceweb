import Database from 'better-sqlite3';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';

const DB_DIR = 'data';
const DB_PATH = join(DB_DIR, 'app.db');

// Ensure data directory exists
mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Migrations ────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    email            TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    username         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    password_hash    TEXT    NOT NULL,
    is_verified      INTEGER NOT NULL DEFAULT 0,
    verification_token           TEXT,
    verification_token_expires   INTEGER,
    reset_token                  TEXT,
    reset_token_expires          INTEGER,
    last_login_at    INTEGER,
    created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    type       TEXT    NOT NULL,
    meta       TEXT    NOT NULL DEFAULT '{}',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_log(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_activity_type       ON activity_log(type);
`);

export default db;

// ── User row type ─────────────────────────────────────────────
export interface UserRow {
	id: number;
	email: string;
	username: string;
	password_hash: string;
	is_verified: 0 | 1;
	verification_token: string | null;
	verification_token_expires: number | null;
	reset_token: string | null;
	reset_token_expires: number | null;
	last_login_at: number | null;
	created_at: number;
	updated_at: number;
}

export interface PublicUser {
	id: number;
	email: string;
	username: string;
	createdAt: number;
}

export function toPublicUser(row: UserRow): PublicUser {
	return {
		id: row.id,
		email: row.email,
		username: row.username,
		createdAt: row.created_at
	};
}
