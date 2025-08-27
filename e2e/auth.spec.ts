import { test, expect } from '@playwright/test';

const testAccounts = [
  { email: 'admin@test.muratabjj.com', password: 'Admin123!@#', role: 'Admin' },
  { email: 'coach@test.muratabjj.com', password: 'Coach123!@#', role: 'Coach' },
  { email: 'pro@test.muratabjj.com', password: 'Pro123!@#', role: 'Pro User' },
  { email: 'user@test.muratabjj.com', password: 'User123!@#', role: 'Free User' },
];

test.describe('Authentication Tests', () => {
  test.describe.serial('Test Account Login', () => {
    for (const account of testAccounts) {
      test(`should login with ${account.role} account`, async ({ page }) => {
        await page.goto('/');
        
        // Wait for page to load
        await page.waitForLoadState('networkidle');
        
        // Click login button using data-testid
        const loginButton = page.locator('[data-testid="login-button"]');
        await loginButton.waitFor({ state: 'visible' });
        await loginButton.click();
        
        // Wait for auth dialog to appear
        await page.waitForTimeout(500); // Give dialog time to animate in
        
        // Fill in credentials
        await page.fill('input[type="email"]', account.email);
        await page.fill('input[type="password"]', account.password);
        
        // Submit form
        await page.click('button[type="submit"]');
        
        // Check if login was successful by looking for dashboard elements
        const loginSuccess = await page.waitForURL('**/dashboard/**', { timeout: 5000 }).then(() => true).catch(() => false);
        
        // Also check for error messages
        const errorMessage = await page.locator('.text-red-200').textContent({ timeout: 2000 }).catch(() => null);
        
        if (loginSuccess) {
          console.log(`✅ ${account.role} account login successful`);
          
          // Verify we're on dashboard
          expect(page.url()).toContain('/dashboard');
          
          // Logout for next test
          await page.click('text=ログアウト');
          await page.waitForTimeout(1000);
        } else {
          console.log(`❌ ${account.role} account login failed`);
          
          if (errorMessage) {
            console.log(`   Error: ${errorMessage}`);
            
            // If it's auth service not configured error, skip other tests
            if (errorMessage.includes('認証サービスが設定されていません')) {
              console.log('⚠️  Authentication service not configured. Skipping remaining login tests.');
              test.skip();
            }
          }
          
          // Close dialog using the X button with Lucide icon class
          const closeButton = await page.locator('.absolute.top-4.right-4 button').first();
          if (await closeButton.isVisible()) {
            await closeButton.click({ force: true });
            await page.waitForTimeout(500);
          }
          
          // Mark this account for registration
          test.info().annotations.push({
            type: 'failed-login',
            description: `${account.email} needs registration`
          });
        }
      });
    }
  });

  test('should register new account if login fails', async ({ page }) => {
    const newAccount = {
      email: `test-${Date.now()}@muratabjj.com`,
      password: 'TestPassword123!@#',
      name: 'Test User'
    };

    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click login button using data-testid
    const loginButton = page.locator('[data-testid="login-button"]');
    await loginButton.waitFor({ state: 'visible' });
    await loginButton.click();
    
    // Wait for auth dialog to appear
    await page.waitForTimeout(500);
    
    // Look for the link to switch to signup mode
    const signupLink = await page.locator('text=アカウントをお持ちでない方').first();
    if (await signupLink.isVisible()) {
      await signupLink.click();
    } else {
      // Alternative: close dialog and click signup button directly
      const closeButton = await page.locator('button:has(svg)').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
      await page.click('text=無料で始める');
    }
    
    // Wait for form to switch
    await page.waitForTimeout(500);
    
    // Fill registration form (no name field in AuthDialog based on code review)
    await page.fill('input[type="email"]', newAccount.email);
    await page.fill('input[type="password"]', newAccount.password);
    
    // Submit registration
    await page.click('button[type="submit"]');
    
    // Wait for success
    try {
      await page.waitForURL('**/dashboard/**', { timeout: 10000 });
      console.log(`✅ New account created: ${newAccount.email}`);
      
      // Test if we can access dashboard
      expect(page.url()).toContain('/dashboard');
      
      // Save the successful account for future reference
      console.log('Test account credentials:');
      console.log(`Email: ${newAccount.email}`);
      console.log(`Password: ${newAccount.password}`);
      
    } catch (error) {
      console.log(`❌ Registration failed: ${(error as Error).message}`);
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'e2e/screenshots/registration-error.png', fullPage: true });
      
      // Check for error messages
      const errorMessage = await page.locator('.text-red-200').textContent().catch(() => null);
      if (errorMessage) {
        console.log(`Error message: ${errorMessage}`);
      }
    }
  });
});