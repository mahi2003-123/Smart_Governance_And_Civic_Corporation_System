import { test, expect } from '@playwright/test';

test.describe('Citizen Portal Features', () => {
  const citizenEmail = process.env.CITIZEN_EMAIL || 'citizen1@sgcs.com';
  const citizenPassword = process.env.CITIZEN_PASSWORD || 'password123';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', citizenEmail);
    await page.fill('input[name="password"]', citizenPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/citizen\/dashboard/);
  });

  test('Access profile', async ({ page }) => {
    await page.goto('/citizen/profile');
    await expect(page.locator('text=/Profile/i').first()).toBeVisible();
  });

  test('Access notices and proposals', async ({ page }) => {
    await page.goto('/citizen/notices');
    await expect(page.locator('text=/Notices/i').first()).toBeVisible();

    await page.goto('/citizen/proposals');
    await expect(page.locator('text=/Proposals/i').first()).toBeVisible();
  });

  test('Complaint Form validations and submission', async ({ page }) => {
    await page.goto('/citizen/complaints/submit');
    
    // Attempt empty submit
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/required/i').first()).toBeVisible();
    
    // Fill properly (Phase 1 manual ward)
    await page.fill('input[name="title"]', 'Leaking Water Pipe');
    await page.fill('textarea[name="description"]', 'Water is leaking continuously from the pipeline near the junction.');
    await page.selectOption('select[name="ward"]', { index: 1 });
    await page.fill('input[name="location"]', 'Main Junction');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/Complaint submitted/i').first()).toBeVisible({ timeout: 15_000 });
  });

  test('Complaint history and tracking', async ({ page }) => {
    await page.goto('/citizen/complaints');
    await expect(page.locator('table, .complaint-list')).toBeVisible();
    
    // Open details
    const firstDetailButton = page.locator('button:has-text("View"), a.view-details').first();
    if(await firstDetailButton.isVisible()) {
      await firstDetailButton.click();
      await expect(page.locator('text=/Complaint Details/i').first()).toBeVisible();
    }
  });
});
