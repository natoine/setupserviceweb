import { json } from '@sveltejs/kit';
import { randomBytes } from 'node:crypto';
import db, { type UserRow } from '$lib/server/db';
import { sendPasswordResetEmail } from '$lib/server/email';
import { logActivity } from '$lib/server/activity';
import { NODE_ENV } from '$env/static/private';
import type { RequestHandler } from './$types';

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);

	if (!body || !body.email) {
		return json({ code: 'MISSING_FIELDS' }, { status: 400 });
	}

	const email: string = body.email.trim().toLowerCase();

	// Always return 200 — don't reveal if the email exists
	const user = db
		.prepare('SELECT * FROM users WHERE email = ? AND is_verified = 1')
		.get(email) as UserRow | undefined;

	if (user) {
		const resetToken = randomBytes(32).toString('hex');
		const expires = Date.now() + RESET_TTL_MS;

		db.prepare(`
			UPDATE users SET reset_token = ?, reset_token_expires = ?, updated_at = unixepoch() WHERE id = ?
		`).run(resetToken, expires, user.id);

		try {
			await sendPasswordResetEmail(email, resetToken);
			logActivity('email_password_reset_sent', { to: email });
		} catch {
			if (NODE_ENV === 'development') {
				console.log(`[dev] Reset token for ${email}: ${resetToken}`);
			}
		}
	}

	return json({ ok: true });
};
