import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, ADMIN_EMAIL, NODE_ENV } from '$env/static/private';
import { sendAdminAccessEmail } from '$lib/server/email';
import { logActivity } from '$lib/server/activity';
import type { RequestHandler } from './$types';

const TOKEN_EXPIRY = '4d';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);

	if (!body || !body.email) {
		return json({ code: 'MISSING_FIELDS' }, { status: 400 });
	}

	const email: string = body.email.trim().toLowerCase();

	// Always return the same response — never reveal if email is admin
	if (email === ADMIN_EMAIL.toLowerCase()) {
		const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

		try {
			await sendAdminAccessEmail(email, token);
			logActivity('email_admin_access_sent', { to: email });
		} catch {
			if (NODE_ENV === 'development') {
				console.log(`[dev] Admin access link: /admin/login?token=${token}`);
			}
		}
	}

	return json({ ok: true });
};
