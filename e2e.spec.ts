import { test, expect } from '@playwright/test';

test.describe('ODOS E2E Validation', () => {
  test('Complete User Journey', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    page.on('response', response => {
      if (response.status() >= 400 && response.url().includes('/api/')) {
        console.log(`API ERROR: ${response.url()} - ${response.status()}`);
      }
    });

    console.log('Navigating to login...');
    await page.goto('http://localhost:3000/login');
    
    await page.locator('input[type="email"]').fill('framehausstudios@gmail.com');
    await page.locator('input[type="password"]').fill('password');
    await page.locator('button[type="submit"]').click();
    
    await page.waitForURL('**/home', { timeout: 15000 });
    console.log('Login passed, reached /home');
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'C:\\Users\\Rushikesh\\.gemini\\antigravity-ide\\brain\\da2ed43f-0689-430b-849d-d3c5dac87169\\browser\\home-screenshot.png' });

    console.log('Checking page text again:');
    console.log(await page.locator('body').innerText());
  });
});
