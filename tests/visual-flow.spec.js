import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173/';

test.describe('Epic Combat Rolloff - Visual Flow', () => {
  test('setup screen, combat flow, and combat log', async ({ page }) => {
    test.setTimeout(15000);
    // 1. Navigate and screenshot setup screen
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: 'tests/screenshots/01-setup-screen.png', fullPage: true });

    // Verify setup screen elements
    await expect(page.getByRole('heading', { name: 'Epic Combat Rolloff' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Begin Combat' })).toBeVisible();
    await expect(page.getByText('Allies')).toBeVisible();
    await expect(page.getByText('Enemies')).toBeVisible();

    // 2. Click Begin Combat
    await page.getByRole('button', { name: 'Begin Combat' }).click();
    await expect(page.getByText(/Round 1/)).toBeVisible();

    // 3. Screenshot combat screen
    await page.screenshot({ path: 'tests/screenshots/02-combat-screen.png', fullPage: true });

    // Verify combat screen elements
    await expect(page.getByText(/Round 1/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Resolve Round' })).toBeVisible();

    // 4. Enter roll values: 6 for good guys, 3 for bad guys
    const rollInputs = page.locator('input[placeholder*="1-"]');
    const goodRollInput = rollInputs.nth(0);
    const badRollInput = rollInputs.nth(1);
    await goodRollInput.fill('6');
    await badRollInput.fill('3');

    // 5. Click Resolve Round
    await page.getByRole('button', { name: 'Resolve Round' }).click();
    await expect(page.getByRole('table')).toBeVisible();

    // 6. Final screenshot with combat log
    await page.screenshot({ path: 'tests/screenshots/03-combat-log.png', fullPage: true });

    // Verify combat log populated
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('6')).toBeVisible();
    await expect(page.getByText('3')).toBeVisible();
  });
});
