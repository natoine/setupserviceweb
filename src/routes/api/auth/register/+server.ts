import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import db from '$lib/server/db';
import { sendVerificationEmail } from '$lib/server/email';
import { logActivity } from '$lib/server/activity';
import { NODE_ENV } from '$env/static/private';
import type { RequestHandler } from './$types';

const BCRYPT_ROUNDS = 12;
const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 h

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);

	if (!body || !body.email || !body.password || !body.username) {
		return json({ code: 'MISSING_FIELDS' }, { status: 400 });
	}

	const email: string = body.email.trim().toLowerCase();
	const username: string = body.username.trim();
	const password: string = body.password;

	// Basic validations
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return json({ code: 'INVALID_EMAIL' }, { status: 400 });
	}
	if (password.length < 8) {
		return json({ code: 'PASSWORD_TOO_SHORT' }, { status: 400 });
	}
	if (username.length < 2 || username.length > 24) {
		return json({ code: 'USERNAME_INVALID_LENGTH' }, { status: 400 });
	}
	if (!/^[a-zA-Z0-9_\- ]+$/.test(username)) {
		return json({ code: 'USERNAME_INVALID_CHARS' }, { status: 400 });
	}

	// Check for existing verified account
	const existing = db
		.prepare('SELECT id, is_verified FROM users WHERE email = ?')
		.get(email) as { id: number; is_verified: 0 | 1 } | undefined;

	if (existing?.is_verified) {
		return json({ code: 'EMAIL_ALREADY_USED' }, { status: 409 });
	}

	// Check username uniqueness
	const existingUsername = db
		.prepare('SELECT id FROM users WHERE username = ?')
		.get(username) as { id: number } | undefined;

	if (existingUsername) {
		return json({ code: 'USERNAME_TAKEN' }, { status: 409 });
	}

	const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
	const verificationToken = randomBytes(32).toString('hex');
	const tokenExpires = Date.now() + VERIFICATION_TTL_MS;

	if (existing) {
		// Re-send verification to unverified account
		db.prepare(`
			UPDATE users
			SET password_hash = ?, username = ?, verification_token = ?, verification_token_expires = ?, updated_at = unixepoch()
			WHERE id = ?
		`).run(passwordHash, username, verificationToken, tokenExpires, existing.id);
	} else {
		db.prepare(`
			INSERT INTO users (email, username, password_hash, verification_token, verification_token_expires)
			VALUES (?, ?, ?, ?, ?)
		`).run(email, username, passwordHash, verificationToken, tokenExpires);
	}

	if (!existing) {
		logActivity('account_created', { email, username });
	}

	try {
		await sendVerificationEmail(email, verificationToken);
		logActivity('email_verification_sent', { to: email });
	} catch {
		if (NODE_ENV === 'development') {
			console.log(`[dev] Verification token for ${email}: ${verificationToken}`);
		}
	}

	return json({ ok: true }, { status: 201 });
};
