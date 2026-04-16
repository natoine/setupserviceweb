import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, validateUsername } from '../validation';

describe('validateEmail', () => {
	it('accepts valid emails', () => {
		expect(validateEmail('hero@dungeon.com')).toBe(true);
		expect(validateEmail('a.b+c@d.co.uk')).toBe(true);
	});

	it('rejects invalid emails', () => {
		expect(validateEmail('')).toBe(false);
		expect(validateEmail('notanemail')).toBe(false);
		expect(validateEmail('@nodomain.com')).toBe(false);
		expect(validateEmail('no@')).toBe(false);
		expect(validateEmail('no spaces@test.com')).toBe(false);
	});
});

describe('validatePassword', () => {
	const VALID = 'Str0ng!Pass#12';

	it('accepts a password meeting all ANSSI rules', () => {
		expect(validatePassword(VALID)).toEqual({ valid: true });
	});

	it('rejects passwords shorter than 12 characters', () => {
		expect(validatePassword('Short1!')).toMatchObject({
			valid: false,
			code: 'PASSWORD_TOO_SHORT'
		});
		expect(validatePassword('Short1!XY')).toMatchObject({
			valid: false,
			code: 'PASSWORD_TOO_SHORT'
		});
	});

	it('rejects passwords without an uppercase letter', () => {
		expect(validatePassword('str0ng!pass#12')).toMatchObject({
			valid: false,
			code: 'PASSWORD_MISSING_UPPERCASE'
		});
	});

	it('rejects passwords without a lowercase letter', () => {
		expect(validatePassword('STR0NG!PASS#12')).toMatchObject({
			valid: false,
			code: 'PASSWORD_MISSING_LOWERCASE'
		});
	});

	it('rejects passwords without a digit', () => {
		expect(validatePassword('Strong!Pass#AB')).toMatchObject({
			valid: false,
			code: 'PASSWORD_MISSING_DIGIT'
		});
	});

	it('rejects passwords without a special character', () => {
		expect(validatePassword('Str0ngPass1234')).toMatchObject({
			valid: false,
			code: 'PASSWORD_MISSING_SPECIAL'
		});
	});

	it('accepts passwords exactly 12 characters with full complexity', () => {
		expect(validatePassword('Aa1!Aa1!Aa1!')).toEqual({ valid: true });
	});

	it('rejects empty password', () => {
		expect(validatePassword('')).toMatchObject({ valid: false, code: 'PASSWORD_TOO_SHORT' });
	});
});

describe('validateUsername', () => {
	it('accepts valid usernames', () => {
		expect(validateUsername('Thorin')).toEqual({ valid: true });
		expect(validateUsername('Hero_1')).toEqual({ valid: true });
		expect(validateUsername('Le Brave')).toEqual({ valid: true });
		expect(validateUsername('ab')).toEqual({ valid: true }); // min 2
	});

	it('rejects usernames that are too short', () => {
		expect(validateUsername('a')).toMatchObject({ valid: false, code: 'USERNAME_INVALID_LENGTH' });
	});

	it('rejects usernames that are too long', () => {
		expect(validateUsername('a'.repeat(25))).toMatchObject({
			valid: false,
			code: 'USERNAME_INVALID_LENGTH'
		});
	});

	it('rejects usernames with forbidden characters', () => {
		expect(validateUsername('hero@evil')).toMatchObject({
			valid: false,
			code: 'USERNAME_INVALID_CHARS'
		});
		expect(validateUsername('hero<script>')).toMatchObject({
			valid: false,
			code: 'USERNAME_INVALID_CHARS'
		});
	});

	it('accepts 24-character username (boundary)', () => {
		expect(validateUsername('a'.repeat(24))).toEqual({ valid: true });
	});
});
