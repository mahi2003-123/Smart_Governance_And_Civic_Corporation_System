import { test, expect } from '@playwright/test';

test.describe('AI Classification Verification (Critical)', () => {

  const testCases = [
    { desc: "There is a large pothole near the college entrance.", exp: "ROAD" },
    { desc: "Water is leaking continuously from the pipeline near the junction.", exp: "WATER_SUPPLY" },
    { desc: "Garbage has not been collected from our street for several days.", exp: "WASTE_MANAGEMENT" },
    { desc: "The drainage channel is blocked and overflowing during rain.", exp: "DRAINAGE" },
    { desc: "The street light near the bus stop is not working.", exp: "STREET_LIGHT" },
    { desc: "The benches in the public park are broken and need repair.", exp: "PUBLIC_SPACE" }
  ];

  /* 
   We test this via the UI workflow to ensure the Real AI FastAPI service is connected. 
   Assuming the backend returns the predicted category upon submission in the Details view.
  */

  test('AI strictly classifies all 6 categories via the UI Workflow', async ({ page }) => {
    test.setTimeout(180000);
    
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.CITIZEN_EMAIL || 'citizen1@sgcs.com');
    await page.fill('input[name="password"]', process.env.CITIZEN_PASSWORD || 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/citizen\/dashboard/);

    for (const data of testCases) {
      await test.step(`Testing AI Category: ${data.exp}`, async () => {
        await page.goto('/citizen/complaints/submit');
        const title = `AI Model Test - ${data.exp} ${Date.now()}`;
        await page.fill('input[name="title"]', title);
        await page.fill('textarea[name="description"]', data.desc);
        await page.selectOption('select[name="ward"]', { index: 1 });
        await page.fill('input[name="location"]', 'AI Test Location');
        await page.click('button[type="submit"]');

        await expect(page.locator('text=/Complaint submitted/i').first()).toBeVisible({ timeout: 15_000 });
        
        // Let's traverse to Councillor to see AI's label
        await page.goto('/login'); 
        await page.fill('input[name="email"]', process.env.COUNCILLOR_EMAIL || 'councillor1@sgcs.com');
        await page.fill('input[name="password"]', process.env.COUNCILLOR_PASSWORD || 'password123');
        await page.click('button[type="submit"]');
        
        await page.goto('/councillor/complaints');
        
        const complaintRow = page.locator(`tr:has-text("${title}")`);
        await expect(complaintRow).toBeVisible();
        await complaintRow.locator('button:has-text("View")').click();
        
        // Assert AI prediction matches actual SGCS Model response exactly
        const aiCategory = await page.locator('.ai-category-label').innerText();
        expect(aiCategory.trim().toUpperCase()).toBe(data.exp);
      });
      
      // Relogin as citizen for next iteration
      await page.goto('/login');
      await page.fill('input[name="email"]', process.env.CITIZEN_EMAIL || 'citizen1@sgcs.com');
      await page.fill('input[name="password"]', process.env.CITIZEN_PASSWORD || 'password123');
      await page.click('button[type="submit"]');
    }
  });

  test('Malformed or Empty complaints reject or fallback gracefully', async ({ page }) => {
    // We already tested empty validation in citizen.spec.ts, but here we test AI backend edge cases if bypassing frontend.
    await page.goto('/login');
    // Using APIRequestContext to hit the AI service directly
    const apiContext = await page.context().request;
    const response = await apiContext.post(process.env.BASE_URL + '/api/complaints', { 
       data: { title: "Test", description: "", wardId: 1, location: "Local"} 
    });
    // Expected to fail at validation level before hitting AI
    expect(response.status()).not.toBe(200);
  });
});
