import db from './db';

export type ActivityType =
	| 'account_created'
	| 'account_deleted'
	| 'login'
	| 'login_failed'
	| 'admin_login'
	| 'admin_login_failed'
	| 'password_changed'
	| 'password_reset_requested'
	| 'password_reset_completed'
	| 'account_inactivity_warning_sent'
	| 'account_purged_inactive'
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

/**
 * Anonymise an IP address to reduce personal data exposure (#0021).
 * IPv4 : masks the last octet  (192.168.1.42  → 192.168.1.0)
 * IPv6 : masks the last 80 bits (keeps the first 48-bit prefix)
 */
export function anonymizeIp(ip: string): string {
	// IPv4
	if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
		return ip.replace(/\.\d+$/, '.0');
	}
	// IPv6 — keep only the first 3 groups (48 bits), zero the rest
	const groups = ip.split(':');
	if (groups.length >= 3) {
		return groups.slice(0, 3).join(':') + ':0:0:0:0:0';
	}
	// Unknown format — return a placeholder
	return 'unknown';
}
