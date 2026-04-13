import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import { verifyToken } from '$lib/server/jwt';
import db, { type UserRow } from '$lib/server/db';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// User session
	const userToken = event.cookies.get('app_token');
	if (userToken) {
		const payload = verifyToken(userToken);
		if (payload) {
			const user = db
				.prepare('SELECT id, email, username FROM users WHERE id = ? AND is_verified = 1')
				.get(payload.userId) as Pick<UserRow, 'id' | 'email' | 'username'> | undefined;
			if (user) {
				event.locals.user = { id: user.id, email: user.email, username: user.username };
			}
		}
	}

	// Admin session
	const adminToken = event.cookies.get('app_admin');
	if (adminToken) {
		try {
			const payload = jwt.verify(adminToken, JWT_SECRET) as { role?: string };
			if (payload.role === 'admin') event.locals.isAdmin = true;
		} catch {
			// invalid/expired — leave isAdmin undefined
		}
	}

	return resolve(event);
};
