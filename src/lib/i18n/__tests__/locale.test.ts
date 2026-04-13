import { describe, it, expect } from 'vitest';
import { resolveLocale, DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../index';

describe('resolveLocale', () => {
	it('returns the default locale when no input is provided', () => {
		expect(resolveLocale()).toBe(DEFAULT_LOCALE);
	});

	it('returns "fr" for French locale string', () => {
		expect(resolveLocale('fr')).toBe('fr');
		expect(resolveLocale('fr-FR')).toBe('fr');
		expect(resolveLocale('fr-BE')).toBe('fr');
	});

	it('returns "en" for English locale string', () => {
		expect(resolveLocale('en')).toBe('en');
		expect(resolveLocale('en-US')).toBe('en');
		expect(resolveLocale('en-GB')).toBe('en');
	});

	it('falls back to default for unsupported locales', () => {
		expect(resolveLocale('de')).toBe(DEFAULT_LOCALE);
		expect(resolveLocale('ja')).toBe(DEFAULT_LOCALE);
		expect(resolveLocale('zh-CN')).toBe(DEFAULT_LOCALE);
	});

	it('falls back to default for empty or invalid strings', () => {
		expect(resolveLocale('')).toBe(DEFAULT_LOCALE);
		expect(resolveLocale('   ')).toBe(DEFAULT_LOCALE);
	});

	it('is case-insensitive', () => {
		expect(resolveLocale('FR')).toBe('fr');
		expect(resolveLocale('EN')).toBe('en');
		expect(resolveLocale('Fr-FR')).toBe('fr');
	});

	it('SUPPORTED_LOCALES contains exactly fr and en', () => {
		expect(SUPPORTED_LOCALES).toContain('en');
		expect(SUPPORTED_LOCALES).toContain('fr');
		expect(SUPPORTED_LOCALES).toHaveLength(2);
	});
});
