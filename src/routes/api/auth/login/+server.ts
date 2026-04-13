import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import db, { type UserRow } from '$lib/server/db';
import { signToken } from '$lib/server/jwt';
import { logActivity } from '$lib/server/activity';
import type { RequestHandler } from './$types';

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export const POST: RequestHandler = async ({ request, cookies }) => {
	const body = await request.json().catch(() => null);

	if (!body || !body.email || !body.password) {
		return json({ code: 'MISSING_FIELDS' }, { status: 400 });
	}

	const email: string = body.email.trim().toLowerCase();
	const password: string = body.password;

	const user = db
		.prepare('SELECT * FROM users WHERE email = ?')
		.get(email) as UserRow | undefined;

	const passwordMatch = user ? await bcrypt.compare(password, user.password_hash) : false;

	if (!user || !passwordMatch) {
		return json({ code: 'INVALID_CREDENTIALS' }, { status: 401 });
	}

	if (!user.is_verified) {
		return json({ code: 'EMAIL_NOT_VERIFIED' }, { status: 403 });
	}

	db.prepare(`
		UPDATE users SET last_login_at = unixepoch(), updated_at = unixepoch() WHERE id = ?
	`).run(user.id);

	logActivity('login', { email: user.email, username: user.username });

	const token = signToken({ userId: user.id, email: user.email });

	cookies.set('app_token', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: COOKIE_MAX_AGE
	});

	return json({
		user: { id: user.id, email: user.email, username: user.username }
	});
};
