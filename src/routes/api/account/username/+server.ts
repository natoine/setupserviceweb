import { json } from '@sveltejs/kit';
import db, { type UserRow } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = ({ request, locals }) => {
	if (!locals.user) return json({ code: 'UNAUTHORIZED' }, { status: 401 });

	const body = request.json().catch(() => null);

	return body.then((b) => {
		if (!b || !b.username) return json({ code: 'MISSING_FIELDS' }, { status: 400 });

		const username: string = (b.username as string).trim();

		if (username.length < 2 || username.length > 24) {
			return json({ code: 'USERNAME_INVALID_LENGTH' }, { status: 400 });
		}
		if (!/^[a-zA-Z0-9_\- ]+$/.test(username)) {
			return json({ code: 'USERNAME_INVALID_CHARS' }, { status: 400 });
		}

		const existing = db
			.prepare('SELECT id FROM users WHERE username = ? AND id != ?')
			.get(username, locals.user!.id) as { id: number } | undefined;

		if (existing) return json({ code: 'USERNAME_TAKEN' }, { status: 409 });

		db.prepare(
			'UPDATE users SET username = ?, updated_at = unixepoch() WHERE id = ?'
		).run(username, locals.user!.id);

		return json({ username });
	});
};
