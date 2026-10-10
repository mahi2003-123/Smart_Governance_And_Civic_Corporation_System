import { test, expect } from '@playwright/test';

test.describe('Authentication - Registration E2E Diagnostics', () => {

  test('Registration completes dynamically without arbitrary waits', async ({ page }) => {
    // Navigating
    await page.goto('/register');
    await expect(page).toHaveURL(/.*register/);
    
    // Dynamic Test Dataset
    const timestamp = Date.now();
    const citizen = {
      name: `Test Citizen ${timestamp}`,
      email: `diag${timestamp}@sgcs.com`,
      phone: '9876543210',
      address: 'Fast Diag Block 123',
      password: 'password123'
    };
    
    // Exact Label Validations asserting fail-fast bounds
    const nameField = page.getByLabel('Full Name');
    await expect(nameField).toBeVisible();
    await nameField.fill(citizen.name);
    
    const emailField = page.getByLabel('Email Address');
    await expect(emailField).toBeVisible();
    await emailField.fill(citizen.email);
    
    const mobileField = page.getByLabel('Mobile Phone');
    await expect(mobileField).toBeVisible();
    await mobileField.fill(citizen.phone);
    
    const addressField = page.getByLabel('Residential Address');
    await expect(addressField).toBeVisible();
    await addressField.fill(citizen.address);
    
    // Password Locators
    const passwordField = page.getByLabel('Password', { exact: true });
    await expect(passwordField).toBeVisible();
    await passwordField.fill(citizen.password);
    
    const confirmPasswordField = page.getByLabel('Confirm Password');
    await expect(confirmPasswordField).toBeVisible();
    await confirmPasswordField.fill(citizen.password);
    
    // Terms Checkbox
    const termsCheck = page.getByRole('checkbox', { name: /I confirm that the provided details/i });
    await expect(termsCheck).toBeVisible();
    await termsCheck.check();
    
    // Registration Submission Button
    const submitBtn = page.getByRole('button', { name: /Complete Account Registration/i });
    await expect(submitBtn).toBeEnabled();
    
    // Fire click request mapping API bounds unconditionally
    await submitBtn.click();
    
    // Verify REAL Registration dialog matching React UI output unconditionally.
    // By registering, AuthContext automatically triggers navigate(/citizen/dashboard).
    await expect(page).toHaveURL(/\/citizen\/dashboard/);
  });

});
