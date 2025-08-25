import { test, expect } from '@playwright/test';

test.describe('Real Email Registration Test', () => {
  test('should register with a real email domain', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click signup button
    const signupButton = page.locator('text=無料で始める').first();
    await expect(signupButton).toBeVisible();
    await signupButton.click();
    
    await page.waitForTimeout(1000);
    
    // Use a more realistic email
    const timestamp = Date.now();
    const testEmails = [
      `test${timestamp}@gmail.com`,
      `user${timestamp}@yahoo.com`,
      `demo${timestamp}@outlook.com`,
      `test${timestamp}@muratabjj.com`
    ];
    
    let registrationSuccess = false;
    let successfulEmail = '';
    
    for (const email of testEmails) {
      console.log(`\nTrying to register with: ${email}`);
      
      // Clear form if needed
      const emailInput = page.locator('input[type="email"]');
      await emailInput.clear();
      await emailInput.fill(email);
      
      const passwordInput = page.locator('input[type="password"]');
      await passwordInput.clear();
      await passwordInput.fill('TestPassword123!@#');
      
      // Submit
      await page.click('button[type="submit"]');
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      // Check for success
      if (page.url().includes('/dashboard')) {
        console.log(`✅ Registration successful with ${email}!`);
        registrationSuccess = true;
        successfulEmail = email;
        break;
      }
      
      // Check for errors
      const errorMessage = await page.locator('.text-red-200').textContent().catch(() => null);
      if (errorMessage) {
        console.log(`❌ Error: ${errorMessage}`);
        
        // If it's a different error, might need different approach
        if (!errorMessage.includes('invalid')) {
          console.log('   This might be a different issue than email validation');
        }
      }
    }
    
    if (registrationSuccess) {
      console.log('\n=== SUCCESSFUL TEST ACCOUNT ===');
      console.log(`Email: ${successfulEmail}`);
      console.log('Password: TestPassword123!@#');
      
      // Take screenshot of dashboard
      await page.screenshot({ 
        path: 'e2e/screenshots/registration-success-dashboard.png', 
        fullPage: true 
      });
    } else {
      console.log('\n❌ All registration attempts failed');
      console.log('Possible issues:');
      console.log('1. Supabase email validation settings');
      console.log('2. Email confirmation requirement');
      console.log('3. Rate limiting');
      
      // Take final screenshot
      await page.screenshot({ 
        path: 'e2e/screenshots/registration-all-failed.png', 
        fullPage: true 
      });
    }
    
    expect(registrationSuccess).toBe(true);
  });
});