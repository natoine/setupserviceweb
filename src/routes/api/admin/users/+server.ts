import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin-guard';
import db from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = (event) => {
	const guard = requireAdmin(event);
	if (guard) return guard;

	const users = db.prepare(`
		SELECT
			id, email, username,
			is_verified,
			created_at,
			last_login_at
		FROM users
		ORDER BY created_at DESC
	`).all() as {
		id: number;
		email: string;
		username: string;
		is_verified: 0 | 1;
		created_at: number;
		last_login_at: number | null;
	}[];

	return json({ users });
};
