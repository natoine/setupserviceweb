import { initI18n, resolveLocale } from '$lib/i18n';
import type { LayoutLoad } from './$types';

export const prerender = false;
export const ssr = true;

export const load: LayoutLoad = ({ data }) => {
	const locale = resolveLocale(data?.locale);
	initI18n(locale);
	return { locale };
};
