import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import { verifyToken } from '$lib/server/jwt';
import db, { type UserRow } from '$lib/server/db';
import type { Handle } from '@sveltejs/kit';

// ── Security headers (#0022 HSTS, #0024 no plain-text, #0048 secure defaults) ──

const SECURITY_HEADERS: Record<string, string> = {
	// Force HTTPS for 1 year, include subdomains (#0022, #0024)
	'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
	// Prevent clickjacking
	'X-Frame-Options': 'DENY',
	// Prevent MIME-type sniffing
	'X-Content-Type-Options': 'nosniff',
	// Limit referrer information leakage
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	// Restrict browser APIs to what the app actually uses
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
	// Content Security Policy — 'unsafe-inline' required for SvelteKit hydration
	'Content-Security-Policy': [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline'",
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' data:",
		"font-src 'self'",
		"connect-src 'self'",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'"
	].join('; ')
};

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

	const response = await resolve(event);

	for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
		response.headers.set(header, value);
	}

	return response;
};
