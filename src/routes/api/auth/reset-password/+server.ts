import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import db, { type UserRow } from '$lib/server/db';
import type { RequestHandler } from './$types';

const BCRYPT_ROUNDS = 12;

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);

	if (!body || !body.token || !body.password) {
		return json({ code: 'MISSING_FIELDS' }, { status: 400 });
	}

	if (body.password.length < 8) {
		return json({ code: 'PASSWORD_TOO_SHORT' }, { status: 400 });
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

	return json({ ok: true });
};
