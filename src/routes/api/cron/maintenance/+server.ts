import { json } from '@sveltejs/kit';
import { CRON_SECRET } from '$env/static/private';
import { sendInactivityWarnings, purgeInactiveAccounts } from '$lib/server/maintenance';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const auth = request.headers.get('authorization');
	if (!auth || auth !== `Bearer ${CRON_SECRET}`) {
		return json({ code: 'UNAUTHORIZED' }, { status: 401 });
	}

	const warnings = await sendInactivityWarnings();
	const purged = purgeInactiveAccounts();

	return json({
		warnings_sent: warnings.count,
		warning_email_errors: warnings.errors,
		accounts_purged: purged.count
	});
};
