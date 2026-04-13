import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin-guard';
import db, { type UserRow } from '$lib/server/db';
import { logActivity } from '$lib/server/activity';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = (event) => {
	const guard = requireAdmin(event);
	if (guard) return guard;

	const id = Number(event.params.id);
	if (!id) return json({ code: 'INVALID_ID' }, { status: 400 });

	const user = db
		.prepare('SELECT id, email, username FROM users WHERE id = ?')
		.get(id) as Pick<UserRow, 'id' | 'email' | 'username'> | undefined;
	if (!user) return json({ code: 'NOT_FOUND' }, { status: 404 });

	db.prepare('DELETE FROM users WHERE id = ?').run(id);
	logActivity('account_deleted', { email: user.email, username: user.username, deleted_by: 'admin' });

	return json({ ok: true });
};
