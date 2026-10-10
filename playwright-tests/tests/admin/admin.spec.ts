import { test, expect } from '@playwright/test';

test.describe('Admin Control Panel Features', () => {

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sgcs.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test('Admin navigates user management', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page.locator('text=/User Management/i').first()).toBeVisible();
  });

  test('Admin navigates wards management', async ({ page }) => {
    await page.goto('/admin/wards');
    await expect(page.locator('text=/Ward Management/i').first()).toBeVisible();
  });

  test('Admin navigates system activity', async ({ page }) => {
    await page.goto('/admin/activity');
    await expect(page.locator('text=/System Activity/i').first()).toBeVisible();
  });
});
