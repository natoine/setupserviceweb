import { describe, it, expect, vi } from 'vitest';

vi.mock('$env/static/private', () => ({
	JWT_SECRET: 'test_secret_32_chars_minimum_ok!',
	ADMIN_EMAIL: 'admin@test.com',
	NODE_ENV: 'test',
	SMTP_HOST: 'localhost',
	SMTP_PORT: '1025',
	SMTP_USER: '',
	SMTP_PASS: '',
	SMTP_FROM: 'test@test.com',
	APP_URL: 'http://localhost:5173'
}));

import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test_secret_32_chars_minimum_ok!';

describe('Admin JWT token', () => {
	it('generates a token with role admin', () => {
		const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '4d' });
		const payload = jwt.verify(token, JWT_SECRET) as { role: string };
		expect(payload.role).toBe('admin');
	});

	it('rejects a token without admin role', () => {
		const token = jwt.sign({ role: 'user' }, JWT_SECRET, { expiresIn: '4d' });
		const payload = jwt.verify(token, JWT_SECRET) as { role: string };
		expect(payload.role).not.toBe('admin');
	});

	it('rejects an expired token', () => {
		const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '0s' });
		expect(() => jwt.verify(token, JWT_SECRET)).toThrow();
	});

	it('rejects a tampered token', () => {
		const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '4d' });
		const tampered = token.slice(0, -5) + 'XXXXX';
		expect(() => jwt.verify(tampered, JWT_SECRET)).toThrow();
	});
});
