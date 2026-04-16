import { redirect, error } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import { logActivity, anonymizeIp } from '$lib/server/activity';
import type { PageServerLoad } from './$types';

const COOKIE_MAX_AGE = 4 * 24 * 60 * 60; // 4 days in seconds

export const load: PageServerLoad = ({ url, cookies, getClientAddress }) => {
	const token = url.searchParams.get('token');
	const ip = anonymizeIp(getClientAddress());

	if (!token) error(400, 'Token missing.');

	let payload: { role?: string };
	try {
		payload = jwt.verify(token, JWT_SECRET) as { role?: string };
	} catch {
		logActivity('admin_login_failed', { reason: 'invalid_or_expired_token', ip });
		error(400, 'Invalid or expired link.');
	}

	if (payload.role !== 'admin') {
		logActivity('admin_login_failed', { reason: 'wrong_role', ip });
		error(403, 'Access denied.');
	}

	cookies.set('app_admin', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: COOKIE_MAX_AGE
	});

	logActivity('admin_login', { ip });
	redirect(302, '/admin/dashboard');
};
