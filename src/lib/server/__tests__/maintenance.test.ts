import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import Database from 'better-sqlite3';

vi.mock('$env/static/private', () => ({
	JWT_SECRET: 'test_secret_32_chars_minimum_ok!',
	ADMIN_EMAIL: 'admin@test.com',
	NODE_ENV: 'test',
	SMTP_HOST: 'localhost',
	SMTP_PORT: '1025',
	SMTP_USER: '',
	SMTP_PASS: '',
	SMTP_FROM: 'test@test.com',
	APP_URL: 'http://localhost:5173',
	APP_NAME: 'TestApp',
	CRON_SECRET: 'test-cron-secret'
}));

const memDb = new Database(':memory:');
memDb.exec(`
  CREATE TABLE users (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    email                 TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    username              TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    password_hash         TEXT    NOT NULL DEFAULT 'hash',
    is_verified           INTEGER NOT NULL DEFAULT 1,
    verification_token    TEXT,
    verification_token_expires INTEGER,
    reset_token           TEXT,
    reset_token_expires   INTEGER,
    last_login_at         INTEGER,
    inactivity_warning_at INTEGER DEFAULT NULL,
    is_admin              INTEGER NOT NULL DEFAULT 0,
    created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at            INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE TABLE activity_log (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    type       TEXT    NOT NULL,
    meta       TEXT    NOT NULL DEFAULT '{}',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
`);

vi.doMock('../db', () => ({ default: memDb }));
vi.mock('../email', () => ({
	sendInactivityWarningEmail: vi.fn().mockResolvedValue(undefined)
}));

type UserRow = {
	id: number;
	email: string;
	username: string;
	last_login_at: number | null;
	inactivity_warning_at: number | null;
};

function allUsers(): UserRow[] {
	return memDb.prepare('SELECT * FROM users').all() as UserRow[];
}
function allActivity(): { type: string }[] {
	return memDb.prepare('SELECT type FROM activity_log ORDER BY id').all() as { type: string }[];
}

// Helpers to insert test users with specific timestamps
const DAY = 86400; // seconds
const now = Math.floor(Date.now() / 1000);

function insertUser(
	email: string,
	username: string,
	lastLoginAt: number | null,
	createdAt: number = now,
	inactivityWarningAt: number | null = null,
	isAdmin: 0 | 1 = 0
) {
	memDb
		.prepare(
			`INSERT INTO users (email, username, password_hash, is_verified, last_login_at, inactivity_warning_at, is_admin, created_at)
       VALUES (?, ?, 'hash', 1, ?, ?, ?, ?)`
		)
		.run(email, username, lastLoginAt, inactivityWarningAt, isAdmin, createdAt);
}

let sendInactivityWarnings: () => Promise<{ count: number; errors: number }>;
let purgeInactiveAccounts: () => { count: number };

beforeAll(async () => {
	const mod = await import('../maintenance');
	sendInactivityWarnings = mod.sendInactivityWarnings;
	purgeInactiveAccounts = mod.purgeInactiveAccounts;
});

beforeEach(() => {
	memDb.prepare('DELETE FROM users').run();
	memDb.prepare('DELETE FROM activity_log').run();
	vi.clearAllMocks();
});

// ── sendInactivityWarnings ────────────────────────────────────────────────────

describe('sendInactivityWarnings', () => {
	it('sends a warning to a user inactive for more than 30 days', async () => {
		insertUser('old@test.com', 'OldUser', now - 31 * DAY);

		const result = await sendInactivityWarnings();

		expect(result.count).toBe(1);
		expect(result.errors).toBe(0);

		const user = allUsers()[0];
		expect(user.inactivity_warning_at).not.toBeNull();
	});

	it('does not warn a user active within 30 days', async () => {
		insertUser('active@test.com', 'ActiveUser', now - 10 * DAY);

		const result = await sendInactivityWarnings();

		expect(result.count).toBe(0);
		const user = allUsers()[0];
		expect(user.inactivity_warning_at).toBeNull();
	});

	it('does not warn a user who already received a warning', async () => {
		insertUser('warned@test.com', 'WarnedUser', now - 40 * DAY, now - 40 * DAY, now - 5 * DAY);

		const result = await sendInactivityWarnings();

		expect(result.count).toBe(0);
	});

	it('uses created_at when last_login_at is NULL', async () => {
		insertUser('never@test.com', 'NeverLogged', null, now - 35 * DAY);

		const result = await sendInactivityWarnings();

		expect(result.count).toBe(1);
	});

	it('logs account_inactivity_warning_sent activity', async () => {
		insertUser('log@test.com', 'LogUser', now - 31 * DAY);

		await sendInactivityWarnings();

		const activities = allActivity();
		expect(activities.some((a) => a.type === 'account_inactivity_warning_sent')).toBe(true);
	});

	it('sends a warning to an admin inactive for more than 30 days', async () => {
		insertUser('admin@test.com', 'AdminUser', now - 31 * DAY, now - 31 * DAY, null, 1);

		const result = await sendInactivityWarnings();

		expect(result.count).toBe(1);
		const user = allUsers()[0];
		expect(user.inactivity_warning_at).not.toBeNull();
	});

	it('counts email errors without crashing', async () => {
		const { sendInactivityWarningEmail } = await import('../email');
		vi.mocked(sendInactivityWarningEmail).mockRejectedValueOnce(new Error('SMTP down'));

		insertUser('fail@test.com', 'FailUser', now - 31 * DAY);

		const result = await sendInactivityWarnings();

		expect(result.count).toBe(1);
		expect(result.errors).toBe(1);
	});
});

// ── purgeInactiveAccounts ────────────────────────────────────────────────────

describe('purgeInactiveAccounts', () => {
	it('deletes a user whose warning was sent more than 30 days ago and who never logged in since', () => {
		insertUser('purge@test.com', 'PurgeUser', null, now - 70 * DAY, now - 35 * DAY);

		const result = purgeInactiveAccounts();

		expect(result.count).toBe(1);
		expect(allUsers()).toHaveLength(0);
	});

	it('does not delete a user who logged in after the warning', () => {
		const warningAt = now - 35 * DAY;
		insertUser('safe@test.com', 'SafeUser', warningAt + DAY, now - 70 * DAY, warningAt);

		const result = purgeInactiveAccounts();

		expect(result.count).toBe(0);
		expect(allUsers()).toHaveLength(1);
	});

	it('does not delete a user whose warning was sent less than 30 days ago', () => {
		insertUser('recent@test.com', 'RecentWarning', null, now - 40 * DAY, now - 10 * DAY);

		const result = purgeInactiveAccounts();

		expect(result.count).toBe(0);
	});

	it('does not delete users with no warning sent', () => {
		insertUser('nowarning@test.com', 'NoWarning', now - 60 * DAY);

		const result = purgeInactiveAccounts();

		expect(result.count).toBe(0);
	});

	it('logs account_purged_inactive activity', () => {
		insertUser('logpurge@test.com', 'LogPurge', null, now - 70 * DAY, now - 35 * DAY);

		purgeInactiveAccounts();

		const activities = allActivity();
		expect(activities.some((a) => a.type === 'account_purged_inactive')).toBe(true);
	});

	it('never deletes an admin account even if inactive for a long time', () => {
		insertUser('admin@test.com', 'AdminUser', null, now - 70 * DAY, now - 35 * DAY, 1);

		const result = purgeInactiveAccounts();

		expect(result.count).toBe(0);
		expect(allUsers()).toHaveLength(1);
	});

	it('deletes non-admin but not admin when both are eligible', () => {
		insertUser('user@test.com', 'RegularUser', null, now - 70 * DAY, now - 35 * DAY, 0);
		insertUser('admin@test.com', 'AdminUser', null, now - 70 * DAY, now - 35 * DAY, 1);

		const result = purgeInactiveAccounts();

		expect(result.count).toBe(1);
		const remaining = allUsers();
		expect(remaining).toHaveLength(1);
		expect(remaining[0].email).toBe('admin@test.com');
	});
});
