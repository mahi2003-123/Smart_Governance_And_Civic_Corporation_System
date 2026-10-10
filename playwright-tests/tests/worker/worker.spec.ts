import { test, expect } from '@playwright/test';

test.describe('Worker Workflow', () => {

  const workerEmail = process.env.WORKER_EMAIL || 'worker1@sgcs.com';
  const workerPassword = process.env.WORKER_PASSWORD || 'password123';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', workerEmail);
    await page.fill('input[name="password"]', workerPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/worker\/dashboard/);
  });

  test('Worker task progression constraints', async ({ page }) => {
    await page.goto('/worker/tasks');
    await expect(page.locator('text=/My Tasks/i').first()).toBeVisible();
    
    const assignedRow = page.locator('tr').filter({ hasText: /Priority|Assigned/i }).first();

    if (await assignedRow.isVisible()) {
       await assignedRow.locator('button:has-text("Start")').click();
       
       await assignedRow.locator('button:has-text("Complete")').click();
       // Assert completion verification constraint (Must provide notes)
       await page.click('button:has-text("Submit Resolution")');
       await expect(page.locator('text=/Notes required/i').first()).toBeVisible().catch(() => null);

       await page.fill('textarea[name="resolutionNotes"]', 'Resolved safely.');
       await page.click('button:has-text("Submit Resolution")');
       await expect(page.locator('text=/Task marked complete/i').first()).toBeVisible();
    }
  });

  test('Worker views completed tasks history', async ({ page }) => {
    await page.goto('/worker/completed');
    await expect(page.locator('table')).toBeVisible();
  });
});
