import db from './db';
import { logActivity } from './activity';
import { sendInactivityWarningEmail } from './email';

const INACTIVITY_WARNING_DAYS = 30;
const INACTIVITY_PURGE_DAYS = 30;

type UserStub = { id: number; email: string; username: string };

/**
 * Finds verified accounts inactive for ≥30 days with no warning sent yet,
 * emails them, and records the warning timestamp.
 * Admins are included in warnings but never in purge.
 * Returns the number of warnings sent.
 */
export async function sendInactivityWarnings(): Promise<{ count: number; errors: number }> {
	const cutoff = Math.floor(Date.now() / 1000) - INACTIVITY_WARNING_DAYS * 86400;

	const users = db
		.prepare(
			`SELECT id, email, username FROM users
       WHERE is_verified = 1
         AND inactivity_warning_at IS NULL
         AND (
           (last_login_at IS NOT NULL AND last_login_at < :cutoff)
           OR (last_login_at IS NULL AND created_at < :cutoff)
         )`
		)
		.all({ cutoff }) as UserStub[];

	let errors = 0;
	for (const user of users) {
		db.prepare('UPDATE users SET inactivity_warning_at = unixepoch() WHERE id = ?').run(user.id);
		logActivity('account_inactivity_warning_sent', { email: user.email });

		try {
			await sendInactivityWarningEmail(user.email, user.username);
		} catch {
			errors++;
		}
	}

	return { count: users.length, errors };
}

/**
 * Deletes non-admin accounts where an inactivity warning was sent ≥30 days ago
 * and the user has not logged in since the warning.
 * Admin accounts (is_admin = 1) are never deleted regardless of inactivity.
 * Returns the number of accounts deleted.
 */
export function purgeInactiveAccounts(): { count: number } {
	const cutoff = Math.floor(Date.now() / 1000) - INACTIVITY_PURGE_DAYS * 86400;

	const users = db
		.prepare(
			`SELECT id, email FROM users
       WHERE is_verified = 1
         AND is_admin = 0
         AND inactivity_warning_at IS NOT NULL
         AND inactivity_warning_at < :cutoff
         AND (last_login_at IS NULL OR last_login_at < inactivity_warning_at)`
		)
		.all({ cutoff }) as { id: number; email: string }[];

	for (const user of users) {
		db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
		logActivity('account_purged_inactive', { email: user.email });
	}

	return { count: users.length };
}
