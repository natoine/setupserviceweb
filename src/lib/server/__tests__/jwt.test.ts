import { describe, it, expect, vi } from 'vitest';

// Mock $env/static/private before importing the module
vi.mock('$env/static/private', () => ({
	JWT_SECRET: 'test_secret_32_chars_minimum_ok!',
	SMTP_HOST: 'localhost',
	SMTP_PORT: '1025',
	SMTP_USER: '',
	SMTP_PASS: '',
	SMTP_FROM: 'test@test.com',
	APP_URL: 'http://localhost:5173',
	NODE_ENV: 'test'
}));

const { signToken, verifyToken } = await import('../jwt');

describe('signToken / verifyToken', () => {
	it('signs and verifies a valid payload', () => {
		const payload = { userId: 1, email: 'hero@dungeon.com' };
		const token = signToken(payload);
		const result = verifyToken(token);

		expect(result).not.toBeNull();
		expect(result?.userId).toBe(1);
		expect(result?.email).toBe('hero@dungeon.com');
	});

	it('returns null for a tampered token', () => {
		const token = signToken({ userId: 1, email: 'hero@dungeon.com' });
		const tampered = token.slice(0, -5) + 'XXXXX';
		expect(verifyToken(tampered)).toBeNull();
	});

	it('returns null for an empty string', () => {
		expect(verifyToken('')).toBeNull();
	});

	it('returns null for a random string', () => {
		expect(verifyToken('not.a.jwt')).toBeNull();
	});

	it('payload preserves userId type as number', () => {
		const token = signToken({ userId: 42, email: 'test@test.com' });
		const result = verifyToken(token);
		expect(typeof result?.userId).toBe('number');
	});
});
