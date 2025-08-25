import { test, expect } from '@playwright/test';

test.describe('Account Registration', () => {
  test('should successfully register a new account', async ({ page }) => {
    const timestamp = Date.now();
    const newAccount = {
      email: `test-${timestamp}@muratabjj.com`,
      password: 'TestPassword123!@#',
    };

    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click signup button directly
    const signupButton = page.locator('text=無料で始める').first();
    await signupButton.waitFor({ state: 'visible' });
    await signupButton.click();
    
    // Wait for auth dialog to appear
    await page.waitForTimeout(1000);
    
    // Fill registration form
    await page.fill('input[type="email"]', newAccount.email);
    await page.fill('input[type="password"]', newAccount.password);
    
    console.log(`Attempting to register: ${newAccount.email}`);
    
    // Submit registration
    await page.click('button[type="submit"]');
    
    // Wait for either success or error
    const [navigation, errorMessage] = await Promise.all([
      page.waitForURL('**/dashboard/**', { timeout: 15000 }).catch(() => null),
      page.locator('.text-red-200').textContent({ timeout: 5000 }).catch(() => null)
    ]);
    
    if (navigation) {
      console.log(`✅ Registration successful!`);
      console.log(`   Email: ${newAccount.email}`);
      console.log(`   Password: ${newAccount.password}`);
      
      // Verify we're on dashboard
      expect(page.url()).toContain('/dashboard');
      
      // Take screenshot of dashboard
      await page.screenshot({ 
        path: `e2e/screenshots/registration-success-${timestamp}.png`, 
        fullPage: true 
      });
      
      // Try to find user info on dashboard
      const userName = await page.locator('text=' + newAccount.email).textContent().catch(() => null);
      if (userName) {
        console.log(`   User email visible on dashboard: ${userName}`);
      }
      
    } else if (errorMessage) {
      console.log(`❌ Registration failed with error: ${errorMessage}`);
      
      // Take screenshot for debugging
      await page.screenshot({ 
        path: `e2e/screenshots/registration-error-${timestamp}.png`, 
        fullPage: true 
      });
      
      throw new Error(`Registration failed: ${errorMessage}`);
    } else {
      console.log('❌ Registration failed - timeout waiting for response');
      
      // Take screenshot for debugging
      await page.screenshot({ 
        path: `e2e/screenshots/registration-timeout-${timestamp}.png`, 
        fullPage: true 
      });
      
      throw new Error('Registration timeout');
    }
  });

  test('should create multiple test accounts for different roles', async ({ page }) => {
    const testRoles = ['admin', 'coach', 'pro', 'free'];
    const successfulAccounts = [];

    for (const role of testRoles) {
      const timestamp = Date.now();
      const newAccount = {
        email: `test-${role}-${timestamp}@muratabjj.com`,
        password: `Test${role.charAt(0).toUpperCase() + role.slice(1)}123!@#`,
        role: role
      };

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Click signup button
      const signupButton = page.locator('text=無料で始める').first();
      await signupButton.waitFor({ state: 'visible' });
      await signupButton.click();
      
      await page.waitForTimeout(1000);
      
      // Fill and submit form
      await page.fill('input[type="email"]', newAccount.email);
      await page.fill('input[type="password"]', newAccount.password);
      await page.click('button[type="submit"]');
      
      // Check result
      const success = await page.waitForURL('**/dashboard/**', { timeout: 10000 })
        .then(() => true)
        .catch(() => false);
      
      if (success) {
        successfulAccounts.push(newAccount);
        console.log(`✅ Created ${role} account: ${newAccount.email}`);
        
        // Logout for next account
        await page.goto('/dashboard/profile');
        const logoutButton = await page.locator('text=ログアウト').first();
        if (await logoutButton.isVisible()) {
          await logoutButton.click();
          await page.waitForTimeout(1000);
        }
      } else {
        console.log(`❌ Failed to create ${role} account`);
      }
      
      // Wait between registrations
      await page.waitForTimeout(2000);
    }

    // Print summary
    console.log('\n=== Test Accounts Created ===');
    successfulAccounts.forEach(account => {
      console.log(`${account.role}: ${account.email} / ${account.password}`);
    });
  });
});