import { resolveLocale } from '$lib/i18n';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ request, cookies, locals }) => {
	// Priority: cookie > Accept-Language header
	const cookieLocale = cookies.get('locale');
	const acceptLanguage = request.headers.get('accept-language') ?? undefined;
	const headerLocale = acceptLanguage?.split(',')[0]?.split(';')[0]?.trim();
	const locale = resolveLocale(cookieLocale ?? headerLocale);
	return { locale, user: locals.user ?? null };
};
