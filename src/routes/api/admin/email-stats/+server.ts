import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin-guard';
import db from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = (event) => {
	const guard = requireAdmin(event);
	if (guard) return guard;

	const now = new Date();
	const year  = Math.max(2020, Number(event.url.searchParams.get('year'))  || now.getFullYear());
	const month = Math.min(12, Math.max(1, Number(event.url.searchParams.get('month')) || now.getMonth() + 1));

	// Unix timestamps for the month boundaries (seconds)
	const from = Math.floor(new Date(year, month - 1, 1).getTime() / 1000);
	const to   = Math.floor(new Date(year, month,     1).getTime() / 1000);

	// All email types start with 'email_'
	const rows = db.prepare(`
		SELECT
			date(created_at, 'unixepoch', 'localtime') AS day,
			COUNT(*) AS count
		FROM activity_log
		WHERE type LIKE 'email_%'
		  AND created_at >= ?
		  AND created_at <  ?
		GROUP BY day
		ORDER BY day ASC
	`).all(from, to) as { day: string; count: number }[];

	// Fill every day of the month with 0 if not present
	const daysInMonth = new Date(year, month, 0).getDate();
	const map = Object.fromEntries(rows.map((r) => [r.day, r.count]));

	const days = Array.from({ length: daysInMonth }, (_, i) => {
		const d   = String(i + 1).padStart(2, '0');
		const mo  = String(month).padStart(2, '0');
		const key = `${year}-${mo}-${d}`;
		return { date: key, count: map[key] ?? 0 };
	});

	return json({ days, year, month });
};
