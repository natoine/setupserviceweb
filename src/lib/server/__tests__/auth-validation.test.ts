import { describe, it, expect } from 'vitest';

// Extracted validation logic (pure functions, no DB/env deps)
function validateEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): boolean {
	return password.length >= 8;
}

function validateUsername(username: string): { valid: boolean; code?: string } {
	if (username.length < 2 || username.length > 24) {
		return { valid: false, code: 'USERNAME_INVALID_LENGTH' };
	}
	if (!/^[a-zA-Z0-9_\- ]+$/.test(username)) {
		return { valid: false, code: 'USERNAME_INVALID_CHARS' };
	}
	return { valid: true };
}

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
	it('accepts passwords with 8+ characters', () => {
		expect(validatePassword('12345678')).toBe(true);
		expect(validatePassword('a_very_long_password_ok')).toBe(true);
	});

	it('rejects passwords shorter than 8 characters', () => {
		expect(validatePassword('')).toBe(false);
		expect(validatePassword('1234567')).toBe(false);
	});
});

describe('validateUsername', () => {
	it('accepts valid usernames', () => {
		expect(validateUsername('Thorin').valid).toBe(true);
		expect(validateUsername('Hero_1')).toMatchObject({ valid: true });
		expect(validateUsername('Le Brave')).toMatchObject({ valid: true });
		expect(validateUsername('ab')).toMatchObject({ valid: true }); // min 2
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
		expect(validateUsername('a'.repeat(24))).toMatchObject({ valid: true });
	});
});
