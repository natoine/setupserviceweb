import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

/** Returns a 401 response if the request is not from an admin, otherwise null. */
export function requireAdmin(event: RequestEvent) {
	if (!event.locals.isAdmin) {
		return json({ code: 'UNAUTHORIZED' }, { status: 401 });
	}
	return null;
}
