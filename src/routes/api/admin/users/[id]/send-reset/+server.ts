import { json } from '@sveltejs/kit';
import { randomBytes } from 'node:crypto';
import { requireAdmin } from '$lib/server/admin-guard';
import db, { type UserRow } from '$lib/server/db';
import { sendPasswordResetEmail } from '$lib/server/email';
import { logActivity } from '$lib/server/activity';
import { NODE_ENV } from '$env/static/private';
import type { RequestHandler } from './$types';

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

export const POST: RequestHandler = async (event) => {
	const guard = requireAdmin(event);
	if (guard) return guard;

	const id = Number(event.params.id);
	if (!id) return json({ code: 'INVALID_ID' }, { status: 400 });

	const user = db
		.prepare('SELECT id, email, is_verified FROM users WHERE id = ?')
		.get(id) as Pick<UserRow, 'id' | 'email' | 'is_verified'> | undefined;

	if (!user) return json({ code: 'NOT_FOUND' }, { status: 404 });

	const resetToken = randomBytes(32).toString('hex');
	const expires = Date.now() + RESET_TTL_MS;

	db.prepare(`
		UPDATE users SET reset_token = ?, reset_token_expires = ?, updated_at = unixepoch() WHERE id = ?
	`).run(resetToken, expires, user.id);

	try {
		await sendPasswordResetEmail(user.email, resetToken);
		logActivity('email_password_reset_sent', { to: user.email, sent_by: 'admin' });
	} catch {
		if (NODE_ENV === 'development') {
			console.log(`[dev] Password reset token for ${user.email}: ${resetToken}`);
		}
	}

	return json({ ok: true });
};
