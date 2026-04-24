import { test, expect } from '@playwright/test';

test.describe('Pages d\'authentification', () => {
	test('la page de connexion est accessible', async ({ page }) => {
		await page.goto('/login');
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		await expect(page.getByLabel(/email/i)).toBeVisible();
		await expect(page.locator('input[type="password"]').first()).toBeVisible();
		await expect(page.getByRole('button', { name: /connect|log in/i })).toBeVisible();
	});

	test('la page d\'inscription est accessible', async ({ page }) => {
		await page.goto('/register');
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		await expect(page.getByLabel(/email/i)).toBeVisible();
		await expect(page.locator('input[type="password"]').first()).toBeVisible();
	});

	test('la page mot de passe oublié est accessible', async ({ page }) => {
		await page.goto('/forgot-password');
		await expect(page.getByLabel(/email/i)).toBeVisible();
	});

	test('un email invalide affiche une erreur à la connexion', async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel(/email/i).fill('invalide@');
		await page.locator('input[type="password"]').first().fill('WrongPass1!X');
		await page.getByRole('button', { name: /connect|log in/i }).click();
		await expect(page.getByRole('alert').or(page.locator('.error-msg, [data-error]'))).toBeVisible();
	});

	test('des identifiants incorrects affichent une erreur', async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel(/email/i).fill('inexistant@example.com');
		await page.locator('input[type="password"]').first().fill('WrongPass1!X');
		await page.getByRole('button', { name: /connect|log in/i }).click();
		await expect(page.getByRole('alert').or(page.locator('.error-msg, [data-error]'))).toBeVisible();
	});

	test('le lien vers la page d\'inscription est présent sur /login', async ({ page }) => {
		await page.goto('/login');
		const link = page.getByRole('link', { name: /inscri|sign up|register/i }).first();
		await expect(link).toBeVisible();
	});
});
