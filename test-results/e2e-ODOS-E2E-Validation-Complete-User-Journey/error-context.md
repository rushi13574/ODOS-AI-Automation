# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> ODOS E2E Validation >> Complete User Journey
- Location: e2e.spec.ts:4:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/home" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - link [ref=e5] [cursor=pointer]:
          - /url: /
          - heading "ODOS" [level=1] [ref=e6]
        - paragraph [ref=e7]: Sign in to continue learning
      - generic [ref=e8]:
        - generic [ref=e9]:
          - generic [ref=e10]: Failed to fetch
          - generic [ref=e11]:
            - generic [ref=e12]: Email
            - textbox "Email" [ref=e13]:
              - /placeholder: you@example.com
              - text: framehausstudios@gmail.com
          - generic [ref=e14]:
            - generic [ref=e15]: Password
            - textbox "Password" [ref=e16]:
              - /placeholder: ••••••••
              - text: password
          - button "Sign In" [ref=e17]
        - paragraph [ref=e18]:
          - text: Don't have an account?
          - link "Sign up" [ref=e19] [cursor=pointer]:
            - /url: /signup
  - button "Open Next.js Dev Tools" [ref=e25] [cursor=pointer]
  - alert [ref=e29]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('ODOS E2E Validation', () => {
  4  |   test('Complete User Journey', async ({ page }) => {
  5  |     test.setTimeout(120000); // 2 minutes
  6  | 
  7  |     page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  8  |     page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  9  |     page.on('response', response => {
  10 |       if (response.status() >= 400 && response.url().includes('/api/')) {
  11 |         console.log(`API ERROR: ${response.url()} - ${response.status()}`);
  12 |       }
  13 |     });
  14 | 
  15 |     console.log('Navigating to login...');
  16 |     await page.goto('http://localhost:3000/login');
  17 |     
  18 |     await page.locator('input[type="email"]').fill('framehausstudios@gmail.com');
  19 |     await page.locator('input[type="password"]').fill('password');
  20 |     await page.locator('button[type="submit"]').click();
  21 |     
> 22 |     await page.waitForURL('**/home', { timeout: 15000 });
     |                ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
  23 |     console.log('Login passed, reached /home');
  24 |     
  25 |     await page.waitForTimeout(3000);
  26 |     await page.screenshot({ path: 'C:\\Users\\Rushikesh\\.gemini\\antigravity-ide\\brain\\da2ed43f-0689-430b-849d-d3c5dac87169\\browser\\home-screenshot.png' });
  27 | 
  28 |     console.log('Checking page text again:');
  29 |     console.log(await page.locator('body').innerText());
  30 |   });
  31 | });
  32 | 
```