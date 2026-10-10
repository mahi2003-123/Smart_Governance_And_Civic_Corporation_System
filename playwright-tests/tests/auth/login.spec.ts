import { test, expect } from '@playwright/test';

test.describe('Authentication - Login', () => {
  const citizenEmail = process.env.CITIZEN_EMAIL || 'citizen1@sgcs.com';
  const citizenPassword = process.env.CITIZEN_PASSWORD || 'password123';

  test('Login page validation checks', async ({ page }) => {
    await page.goto('/login');
    
    // Submit empty
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/Required/i').first()).toBeVisible();
    
    // Invalid credentials
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/Invalid credentials|User not found/i').first()).toBeVisible();
  });

  test('Valid login redirect to Citizen dashboard and logout', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', citizenEmail);
    await page.fill('input[name="password"]', citizenPassword);
    await page.click('button[type="submit"]');
    
    // Verify Redirect
    await expect(page).toHaveURL(/\/citizen\/dashboard/, { timeout: 10000 });
    
    // Logout
    await page.click('button:has-text("Logout"), a:has-text("Logout")');
    await expect(page).toHaveURL(/\/login/);
  });
});
