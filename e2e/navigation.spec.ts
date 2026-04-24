import { test, expect } from '@playwright/test';

test.describe('Navigation principale', () => {
	test("la page d'accueil se charge", async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle(/APP_NAME/);
	});

	test('le footer contient un lien vers le changelog', async ({ page }) => {
		await page.goto('/');
		const footer = page.getByRole('navigation', { name: 'Footer navigation' });
		const link = footer.getByRole('link', { name: /changelog|journal/i });
		await expect(link).toBeVisible();
		await expect(link).toHaveAttribute('href', '/changelog');
	});

	test('le footer contient un lien vers AARRI', async ({ page }) => {
		await page.goto('/');
		const footer = page.getByRole('navigation', { name: 'Footer navigation' });
		const link = footer.getByRole('link', { name: /aarri/i });
		await expect(link).toBeVisible();
		await expect(link).toHaveAttribute('href', '/aarri');
	});

	test('le lien changelog du footer navigue vers /changelog', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('navigation', { name: 'Footer navigation' })
			.getByRole('link', { name: /changelog|journal/i })
			.click();
		await expect(page).toHaveURL('/changelog');
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	});

	test('le lien AARRI du footer navigue vers /aarri', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('navigation', { name: 'Footer navigation' })
			.getByRole('link', { name: /aarri/i })
			.click();
		await expect(page).toHaveURL('/aarri');
		await expect(page.getByRole('heading', { level: 1, name: 'AARRI' })).toBeVisible();
	});
});
