import { redirect } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import db from '$lib/server/db';
import type { PageServerLoad } from './$types';

export interface AdminUser {
	id: number;
	email: string;
	username: string;
	is_verified: 0 | 1;
	created_at: number;
	last_login_at: number | null;
}

export const load: PageServerLoad = ({ cookies }) => {
	const token = cookies.get('app_admin');
	if (!token) redirect(302, '/admin');

	try {
		const payload = jwt.verify(token, JWT_SECRET) as { role?: string };
		if (payload.role !== 'admin') redirect(302, '/admin');
	} catch {
		redirect(302, '/admin');
	}

	const users = db.prepare(`
		SELECT id, email, username, is_verified, created_at, last_login_at
		FROM users
		ORDER BY created_at DESC
	`).all() as AdminUser[];

	const totalUsers = users.length;
	const verifiedUsers = users.filter((u) => u.is_verified).length;

	return { users, stats: { totalUsers, verifiedUsers } };
};
