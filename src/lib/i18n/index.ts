import { init, register } from 'svelte-i18n';

export const SUPPORTED_LOCALES = ['en', 'fr'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

register('en', () => import('./en.json'));
register('fr', () => import('./fr.json'));

export function initI18n(initialLocale?: string) {
	const locale = resolveLocale(initialLocale);
	init({
		fallbackLocale: DEFAULT_LOCALE,
		initialLocale: locale
	});
}

export function resolveLocale(preferred?: string): Locale {
	const candidates: (string | null | undefined)[] = [
		preferred,
		DEFAULT_LOCALE
	];

	for (const candidate of candidates) {
		if (!candidate) continue;
		const short = candidate.slice(0, 2).toLowerCase();
		if (SUPPORTED_LOCALES.includes(short as Locale)) {
			return short as Locale;
		}
	}

	return DEFAULT_LOCALE;
}
