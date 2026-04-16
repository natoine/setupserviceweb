/**
 * Shared validation utilities — used by API routes and tests.
 * Password rules follow ANSSI recommendations (12 chars min + complexity).
 */

export function validateEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export type ValidationResult = { valid: true } | { valid: false; code: string };

/**
 * ANSSI-grade password validation.
 * Rules: min 12 chars, at least one uppercase, one lowercase,
 * one digit, one special character.
 */
export function validatePassword(password: string): ValidationResult {
	if (password.length < 12) {
		return { valid: false, code: 'PASSWORD_TOO_SHORT' };
	}
	if (!/[A-Z]/.test(password)) {
		return { valid: false, code: 'PASSWORD_MISSING_UPPERCASE' };
	}
	if (!/[a-z]/.test(password)) {
		return { valid: false, code: 'PASSWORD_MISSING_LOWERCASE' };
	}
	if (!/[0-9]/.test(password)) {
		return { valid: false, code: 'PASSWORD_MISSING_DIGIT' };
	}
	if (!/[^A-Za-z0-9]/.test(password)) {
		return { valid: false, code: 'PASSWORD_MISSING_SPECIAL' };
	}
	return { valid: true };
}

export function validateUsername(username: string): ValidationResult {
	if (username.length < 2 || username.length > 24) {
		return { valid: false, code: 'USERNAME_INVALID_LENGTH' };
	}
	if (!/^[a-zA-Z0-9_\- ]+$/.test(username)) {
		return { valid: false, code: 'USERNAME_INVALID_CHARS' };
	}
	return { valid: true };
}
