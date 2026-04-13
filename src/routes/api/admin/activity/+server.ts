import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin-guard';
import db from '$lib/server/db';
import type { ActivityRow } from '$lib/server/activity';
import type { RequestHandler } from './$types';

const PAGE_SIZE = 30;

export const GET: RequestHandler = (event) => {
	const guard = requireAdmin(event);
	if (guard) return guard;

	const page = Math.max(1, Number(event.url.searchParams.get('page')) || 1);
	const offset = (page - 1) * PAGE_SIZE;

	const items = db.prepare(`
		SELECT id, type, meta, created_at
		FROM activity_log
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?
	`).all(PAGE_SIZE, offset) as ActivityRow[];

	const { total } = db.prepare(
		'SELECT COUNT(*) as total FROM activity_log'
	).get() as { total: number };

	return json({
		items,
		total,
		page,
		pages: Math.ceil(total / PAGE_SIZE)
	});
};
