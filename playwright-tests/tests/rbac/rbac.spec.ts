import { test, expect } from '@playwright/test';

test.describe('Role Based Access Control Verification', () => {

  const citizenEmail = process.env.CITIZEN_EMAIL || 'citizen1@sgcs.com';
  const citizenPassword = process.env.CITIZEN_PASSWORD || 'password123';

  test('Unauthenticated user cannot access protected routes', async ({ page }) => {
    await page.goto('/citizen/dashboard');
    // Expect forced redirection
    await expect(page).toHaveURL(/.*login|.*unauthorized/i);
    
    await page.goto('/admin/users');
    await expect(page).toHaveURL(/.*login|.*unauthorized/i);
  });

  test('Citizen cannot breach councillor or admin boundaries', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', citizenEmail);
    await page.fill('input[name="password"]', citizenPassword);
    await page.click('button[type="submit"]');
    
    // Try breaching Worker
    await page.goto('/worker/tasks');
    await expect(page.locator('text=/Unauthorized|Access Denied|Not Found/i')).toBeVisible();

    // Try breaching Admin
    await page.goto('/admin/dashboard');
    await expect(page.locator('text=/Unauthorized|Access Denied|Not Found/i')).toBeVisible();
  });
});
