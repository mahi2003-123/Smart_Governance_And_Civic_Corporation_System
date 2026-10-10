import { test, expect } from '@playwright/test';

test.describe('Councillor Workflow', () => {

  const councillorEmail = process.env.COUNCILLOR_EMAIL || 'councillor1@sgcs.com';
  const councillorPassword = process.env.COUNCILLOR_PASSWORD || 'password123';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', councillorEmail);
    await page.fill('input[name="password"]', councillorPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/councillor\/dashboard/);
  });

  test('Councillor views complaints and assigns worker', async ({ page }) => {
    await page.goto('/councillor/complaints');
    await expect(page.locator('table')).toBeVisible();

    // Assign worker to first unassigned
    const unassignedRow = page.locator('tr:has-text("Unassigned")').first();
    
    if (await unassignedRow.isVisible()) {
        await unassignedRow.locator('button:has-text("View")').click();
        
        await page.selectOption('select[name="priority"]', 'High');
        
        const workerSelect = page.locator('select[name="workerAssignment"]');
        await expect(workerSelect).not.toContainText('No Workers');
        
        await workerSelect.selectOption({ index: 1 });
        await page.click('button:has-text("Assign Worker")');
        
        await expect(page.locator('text=/Worker assigned/i')).toBeVisible();
    }
  });

  test('Councillor views proposals and announcements', async ({ page }) => {
    await page.goto('/councillor/proposals');
    await expect(page.locator('text=/Proposals/i').first()).toBeVisible();

    await page.goto('/councillor/announcements');
    await expect(page.locator('text=/Announcements/i').first()).toBeVisible();
  });
});
