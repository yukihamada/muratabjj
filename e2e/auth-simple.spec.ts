import { test, expect } from '@playwright/test';

test.describe('Simple Auth Test', () => {
  test('should show auth dialog when clicking login', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click login button
    const loginButton = page.locator('[data-testid="login-button"]');
    await expect(loginButton).toBeVisible();
    await loginButton.click();
    
    // Wait a bit for dialog to appear
    await page.waitForTimeout(1000);
    
    // Check if email input is visible
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    
    // Check if password input is visible
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    
    // Try to fill form with test data
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'e2e/screenshots/auth-dialog-filled.png', 
      fullPage: true 
    });
    
    console.log('✅ Auth dialog is working');
  });

  test('should attempt simple registration', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click signup button
    const signupButton = page.locator('text=無料で始める').first();
    await expect(signupButton).toBeVisible();
    await signupButton.click();
    
    await page.waitForTimeout(1000);
    
    // Fill form
    const timestamp = Date.now();
    const email = `simple-test-${timestamp}@example.com`;
    const password = 'SimpleTest123!';
    
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    
    console.log(`Trying to register: ${email}`);
    
    // Click submit
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    
    // Take screenshot before submit
    await page.screenshot({ 
      path: 'e2e/screenshots/before-submit.png', 
      fullPage: true 
    });
    
    await submitButton.click();
    
    // Wait for any response
    await page.waitForTimeout(5000);
    
    // Take screenshot after submit
    await page.screenshot({ 
      path: 'e2e/screenshots/after-submit.png', 
      fullPage: true 
    });
    
    // Check current URL
    console.log(`Current URL: ${page.url()}`);
    
    // Check for any error messages
    const errorMessages = await page.locator('.text-red-200').allTextContents();
    if (errorMessages.length > 0) {
      console.log('Error messages found:', errorMessages);
    }
    
    // Check if we're on dashboard
    if (page.url().includes('/dashboard')) {
      console.log('✅ Successfully redirected to dashboard!');
    } else {
      console.log('❌ Still on same page');
    }
  });
});