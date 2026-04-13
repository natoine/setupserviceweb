import db from './db';

export type ActivityType =
	| 'account_created'
	| 'account_deleted'
	| 'login'
	| 'email_verification_sent'
	| 'email_password_reset_sent'
	| 'email_admin_access_sent';

export type ActivityMeta = Record<string, string | number | boolean | null>;

export interface ActivityRow {
	id: number;
	type: ActivityType;
	meta: string; // JSON
	created_at: number;
}

const insert = db.prepare(
	'INSERT INTO activity_log (type, meta) VALUES (?, ?)'
);

export function logActivity(type: ActivityType, meta: ActivityMeta = {}): void {
	try {
		insert.run(type, JSON.stringify(meta));
	} catch (err) {
		// Never let logging crash the main request
		console.error('[activity] Failed to log:', type, err);
	}
}
