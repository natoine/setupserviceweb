import { resolveLocale } from '$lib/i18n';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ request, locals }) => {
	const acceptLanguage = request.headers.get('accept-language') ?? undefined;
	const headerLocale = acceptLanguage?.split(',')[0]?.split(';')[0]?.trim();
	const locale = resolveLocale(headerLocale);
	return { locale, user: locals.user ?? null };
};
