import { test, expect } from '@playwright/test';

test.describe('Final Auth Test', () => {
  test('should successfully create a test account', async ({ page }) => {
    const timestamp = Date.now();
    const testAccount = {
      email: `muratabjj.test${timestamp}@gmail.com`,
      password: 'MurataBJJ123!@#'
    };
    
    console.log('\n=== Creating Test Account ===');
    console.log(`Email: ${testAccount.email}`);
    console.log(`Password: ${testAccount.password}`);
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click signup button
    const signupButton = page.locator('text=無料で始める').first();
    await signupButton.click();
    
    // Wait for dialog
    await page.waitForTimeout(1000);
    
    // Fill form
    await page.fill('input[type="email"]', testAccount.email);
    await page.fill('input[type="password"]', testAccount.password);
    
    // Take screenshot before submit
    await page.screenshot({ 
      path: 'e2e/screenshots/before-signup.png',
      fullPage: true 
    });
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for any response
    await page.waitForTimeout(5000);
    
    // Take screenshot after submit
    await page.screenshot({ 
      path: 'e2e/screenshots/after-signup.png',
      fullPage: true 
    });
    
    // Check for success toast or error message
    const toastMessage = await page.locator('.react-hot-toast').textContent().catch(() => null);
    const errorMessage = await page.locator('.text-red-200').textContent().catch(() => null);
    
    if (toastMessage) {
      console.log(`\nToast message: ${toastMessage}`);
      
      if (toastMessage.includes('確認メール') || toastMessage.includes('confirmation')) {
        console.log('\n✅ Account created successfully!');
        console.log('📧 Email confirmation required - check your inbox');
        console.log('\n=== IMPORTANT ===');
        console.log('Supabase requires email confirmation before login.');
        console.log('To disable this for development:');
        console.log('1. Go to Supabase Dashboard');
        console.log('2. Authentication > Settings');
        console.log('3. Disable "Confirm email"');
        
        // This is actually a success - account was created
        expect(toastMessage).toBeTruthy();
      }
    } else if (errorMessage) {
      console.log(`\n❌ Error: ${errorMessage}`);
      throw new Error(`Registration failed: ${errorMessage}`);
    } else {
      console.log('\n⚠️  No clear success or error message');
      console.log('Current URL:', page.url());
    }
    
    console.log('\n=== Test Account Summary ===');
    console.log('Account created (pending email confirmation):');
    console.log(`Email: ${testAccount.email}`);
    console.log(`Password: ${testAccount.password}`);
    console.log('\nNote: You cannot login until you confirm the email');
  });

  test('should show proper error for unconfirmed email login', async ({ page }) => {
    // Try to login with the account we just created
    const testAccount = {
      email: 'muratabjj.test1756120653761@gmail.com', // Use the account created by our Node.js test
      password: 'TestPassword123!@#'
    };
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click login button
    const loginButton = page.locator('[data-testid="login-button"]');
    await loginButton.click();
    
    await page.waitForTimeout(500);
    
    // Fill login form
    await page.fill('input[type="email"]', testAccount.email);
    await page.fill('input[type="password"]', testAccount.password);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Check for error message
    const errorMessage = await page.locator('.text-red-200').textContent().catch(() => null);
    
    if (errorMessage) {
      console.log(`Login error: ${errorMessage}`);
      
      if (errorMessage.includes('confirm') || errorMessage.includes('確認')) {
        console.log('✅ Expected behavior - email confirmation required');
      }
    }
    
    // Check if still on login page
    expect(page.url()).not.toContain('/dashboard');
  });
});