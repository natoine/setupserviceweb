import { json } from '@sveltejs/kit';
import db, { type UserRow } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
	const token = url.searchParams.get('token');

	if (!token) {
		return json({ code: 'MISSING_TOKEN' }, { status: 400 });
	}

	const user = db
		.prepare('SELECT * FROM users WHERE verification_token = ?')
		.get(token) as UserRow | undefined;

	if (!user) {
		return json({ code: 'INVALID_TOKEN' }, { status: 400 });
	}

	if (user.is_verified) {
		return json({ code: 'ALREADY_VERIFIED' }, { status: 400 });
	}

	if (!user.verification_token_expires || user.verification_token_expires < Date.now()) {
		return json({ code: 'TOKEN_EXPIRED' }, { status: 400 });
	}

	db.prepare(`
		UPDATE users
		SET is_verified = 1, verification_token = NULL, verification_token_expires = NULL, updated_at = unixepoch()
		WHERE id = ?
	`).run(user.id);

	return json({ ok: true });
};
