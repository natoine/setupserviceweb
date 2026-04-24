import { test, expect } from '@playwright/test';

test.describe('Page AARRI', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/aarri');
	});

	test('affiche le titre AARRI', async ({ page }) => {
		await expect(page.getByRole('heading', { level: 1, name: 'AARRI' })).toBeVisible();
	});

	test('le tableau AARRI contient les 5 étapes', async ({ page }) => {
		const tables = page.getByRole('table');
		const firstTable = tables.first();

		for (const step of ['Acquisition', 'Activation']) {
			await expect(firstTable.getByText(step)).toBeVisible();
		}
		// Rétention / Retention selon la langue
		await expect(firstTable.getByText(/r[ée]tention/i)).toBeVisible();
		await expect(firstTable.getByText(/r[ée]f[eé]r/i)).toBeVisible();
		await expect(firstTable.getByText('Impact')).toBeVisible();
	});

	test('le tableau AARRI a 3 colonnes', async ({ page }) => {
		const headers = page.getByRole('table').first().getByRole('columnheader');
		await expect(headers).toHaveCount(3);
	});

	test('la matrice d\'impact est présente', async ({ page }) => {
		await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
		const tables = page.getByRole('table');
		await expect(tables).toHaveCount(2);
	});

	test('la matrice d\'impact contient les 4 niveaux', async ({ page }) => {
		const secondTable = page.getByRole('table').nth(1);
		await expect(secondTable.getByText(/utilisable|usable/i)).toBeVisible();
		await expect(secondTable.getByText(/utilis[eé]|used/i).first()).toBeVisible();
		await expect(secondTable.getByText(/^utile$|^useful$/i)).toBeVisible();
		await expect(secondTable.getByText(/impactant|impactful/i)).toBeVisible();
	});

	test('la matrice d\'impact contient 12 lignes de métriques', async ({ page }) => {
		const secondTable = page.getByRole('table').nth(1);
		const rows = secondTable.getByRole('row');
		// 1 header + 12 lignes de métriques (3+4+2+3)
		await expect(rows).toHaveCount(13);
	});
});
