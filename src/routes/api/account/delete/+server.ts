import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import db, { type UserRow } from '$lib/server/db';
import { logActivity } from '$lib/server/activity';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ request, locals, cookies }) => {
	if (!locals.user) return json({ code: 'UNAUTHORIZED' }, { status: 401 });

	const body = await request.json().catch(() => null);

	if (!body || !body.password) {
		return json({ code: 'MISSING_FIELDS' }, { status: 400 });
	}

	const user = db
		.prepare('SELECT password_hash FROM users WHERE id = ?')
		.get(locals.user.id) as Pick<UserRow, 'password_hash'>;

	const match = await bcrypt.compare(body.password, user.password_hash);
	if (!match) return json({ code: 'INVALID_PASSWORD' }, { status: 403 });

	const { email, username } = locals.user;
	db.prepare('DELETE FROM users WHERE id = ?').run(locals.user.id);
	logActivity('account_deleted', { email, username, deleted_by: 'user' });

	cookies.delete('hq_token', { path: '/' });

	return json({ ok: true });
};
