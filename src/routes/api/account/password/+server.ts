import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import db, { type UserRow } from '$lib/server/db';
import type { RequestHandler } from './$types';

const BCRYPT_ROUNDS = 12;

export const PATCH: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) return json({ code: 'UNAUTHORIZED' }, { status: 401 });

	const body = await request.json().catch(() => null);

	if (!body || !body.currentPassword || !body.newPassword) {
		return json({ code: 'MISSING_FIELDS' }, { status: 400 });
	}
	if ((body.newPassword as string).length < 8) {
		return json({ code: 'PASSWORD_TOO_SHORT' }, { status: 400 });
	}

	const user = db
		.prepare('SELECT password_hash FROM users WHERE id = ?')
		.get(locals.user.id) as Pick<UserRow, 'password_hash'>;

	const match = await bcrypt.compare(body.currentPassword, user.password_hash);
	if (!match) return json({ code: 'INVALID_CURRENT_PASSWORD' }, { status: 403 });

	const newHash = await bcrypt.hash(body.newPassword, BCRYPT_ROUNDS);
	db.prepare(
		'UPDATE users SET password_hash = ?, updated_at = unixepoch() WHERE id = ?'
	).run(newHash, locals.user.id);

	return json({ ok: true });
};
