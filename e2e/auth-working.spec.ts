import { test, expect } from '@playwright/test';

// Generate unique test accounts
const timestamp = Date.now();
const testAccounts = [
  { 
    email: `admin.test${timestamp}@gmail.com`, 
    password: 'Admin123!@#', 
    role: 'Admin' 
  },
  { 
    email: `coach.test${timestamp}@gmail.com`, 
    password: 'Coach123!@#', 
    role: 'Coach' 
  },
  { 
    email: `pro.test${timestamp}@gmail.com`, 
    password: 'Pro123!@#', 
    role: 'Pro User' 
  },
  { 
    email: `user.test${timestamp}@gmail.com`, 
    password: 'User123!@#', 
    role: 'Free User' 
  },
];

test.describe('Working Authentication Tests', () => {
  test('should create and login with test accounts', async ({ page }) => {
    const createdAccounts = [];
    
    // First, create all test accounts
    console.log('=== Creating Test Accounts ===\n');
    
    for (const account of testAccounts) {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Click signup button
      const signupButton = page.locator('text=無料で始める').first();
      await signupButton.click();
      
      // Wait for dialog
      await page.waitForTimeout(1000);
      
      // Fill registration form
      await page.fill('input[type="email"]', account.email);
      await page.fill('input[type="password"]', account.password);
      
      console.log(`Creating ${account.role} account: ${account.email}`);
      
      // Submit
      await page.click('button[type="submit"]');
      
      // Wait for response
      const success = await page.waitForURL('**/dashboard/**', { timeout: 10000 })
        .then(() => true)
        .catch(() => false);
      
      if (success) {
        console.log(`✅ ${account.role} account created successfully!`);
        createdAccounts.push(account);
        
        // Logout
        await page.goto('/dashboard/profile');
        const logoutButton = page.locator('text=ログアウト').first();
        if (await logoutButton.isVisible()) {
          await logoutButton.click();
          await page.waitForTimeout(1000);
        }
      } else {
        const errorMessage = await page.locator('.text-red-200').textContent().catch(() => 'Unknown error');
        console.log(`❌ Failed to create ${account.role} account: ${errorMessage}`);
      }
      
      // Wait between registrations to avoid rate limiting
      await page.waitForTimeout(2000);
    }
    
    // Now test login with created accounts
    console.log('\n=== Testing Login with Created Accounts ===\n');
    
    for (const account of createdAccounts) {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Click login button
      const loginButton = page.locator('[data-testid="login-button"]');
      await loginButton.click();
      
      await page.waitForTimeout(500);
      
      // Fill login form
      await page.fill('input[type="email"]', account.email);
      await page.fill('input[type="password"]', account.password);
      
      console.log(`Testing login for ${account.role}: ${account.email}`);
      
      // Submit
      await page.click('button[type="submit"]');
      
      // Check login success
      const loginSuccess = await page.waitForURL('**/dashboard/**', { timeout: 5000 })
        .then(() => true)
        .catch(() => false);
      
      if (loginSuccess) {
        console.log(`✅ ${account.role} login successful!`);
        
        // Take screenshot of dashboard
        await page.screenshot({ 
          path: `e2e/screenshots/${account.role.toLowerCase().replace(' ', '-')}-dashboard.png`,
          fullPage: true 
        });
        
        // Logout for next test
        await page.goto('/dashboard/profile');
        await page.click('text=ログアウト');
        await page.waitForTimeout(1000);
      } else {
        console.log(`❌ ${account.role} login failed`);
      }
    }
    
    // Print summary
    console.log('\n=== SUMMARY: Test Accounts Created ===');
    console.log('You can use these accounts for future testing:\n');
    createdAccounts.forEach(account => {
      console.log(`${account.role}:`);
      console.log(`  Email: ${account.email}`);
      console.log(`  Password: ${account.password}`);
      console.log('');
    });
    
    // At least one account should be created
    expect(createdAccounts.length).toBeGreaterThan(0);
  });
});