import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import db, { type UserRow } from '$lib/server/db';
import { logActivity } from '$lib/server/activity';
import { validatePassword } from '$lib/server/validation';
import type { RequestHandler } from './$types';

const BCRYPT_ROUNDS = 12;

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);

	if (!body || !body.token || !body.password) {
		return json({ code: 'MISSING_FIELDS' }, { status: 400 });
	}

	const pwdResult = validatePassword(body.password as string);
	if (!pwdResult.valid) {
		return json({ code: pwdResult.code }, { status: 400 });
	}

	const user = db
		.prepare('SELECT * FROM users WHERE reset_token = ?')
		.get(body.token) as UserRow | undefined;

	if (!user || !user.reset_token_expires || user.reset_token_expires < Date.now()) {
		return json({ code: 'INVALID_OR_EXPIRED_TOKEN' }, { status: 400 });
	}

	const passwordHash = await bcrypt.hash(body.password, BCRYPT_ROUNDS);

	db.prepare(`
		UPDATE users
		SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL, updated_at = unixepoch()
		WHERE id = ?
	`).run(passwordHash, user.id);

	logActivity('password_reset_completed', { email: user.email });

	return json({ ok: true });
};
