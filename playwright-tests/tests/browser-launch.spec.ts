import { test } from '@playwright/test';

test('Playwright browser launch diagnostic', async ({ page }) => {
    await page.goto('/');
    console.log('Current URL:', page.url());
    await page.screenshot({
        path: 'test-results/browser-launch.png',
        fullPage: true
    });
    await page.waitForTimeout(5000);
});
