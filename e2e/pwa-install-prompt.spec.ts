import { test, expect } from '@playwright/test'

test.describe('PWA Install Prompt', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear all storage
    await context.clearCookies()
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  })

  test('should show install prompt after 5 seconds', async ({ page }) => {
    // Navigate to the page
    await page.goto('/')
    
    // Manually trigger beforeinstallprompt event
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt')
      ;(event as any).prompt = () => Promise.resolve()
      ;(event as any).userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' })
      window.dispatchEvent(event)
    })
    
    // Wait for the prompt to appear (5 seconds delay)
    await page.waitForTimeout(5500)
    
    // Check if prompt is visible
    const prompt = page.locator('text=Murata BJJをホーム画面に追加')
    await expect(prompt).toBeVisible()
  })

  test('should close prompt when clicking X button', async ({ page }) => {
    await page.goto('/')
    
    // Manually trigger beforeinstallprompt event
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt')
      ;(event as any).prompt = () => Promise.resolve()
      ;(event as any).userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' })
      window.dispatchEvent(event)
    })
    
    await page.waitForTimeout(5500)
    
    // Click the close button
    await page.locator('button[aria-label="閉じる"]').first().click()
    
    // Verify prompt is hidden
    const prompt = page.locator('text=Murata BJJをホーム画面に追加')
    await expect(prompt).not.toBeVisible()
    
    // Check session storage
    const sessionValue = await page.evaluate(() => 
      sessionStorage.getItem('pwa-install-closed-this-session')
    )
    expect(sessionValue).toBe('true')
  })

  test('should close prompt when clicking outside modal', async ({ page }) => {
    await page.goto('/')
    
    // Manually trigger beforeinstallprompt event
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt')
      ;(event as any).prompt = () => Promise.resolve()
      ;(event as any).userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' })
      window.dispatchEvent(event)
    })
    
    await page.waitForTimeout(5500)
    
    // Click outside the modal (on the backdrop)
    await page.locator('.fixed.inset-0').click({ position: { x: 10, y: 10 } })
    
    // Verify prompt is hidden
    const prompt = page.locator('text=Murata BJJをホーム画面に追加')
    await expect(prompt).not.toBeVisible()
  })

  test('should close prompt when pressing Escape key', async ({ page }) => {
    await page.goto('/')
    
    // Manually trigger beforeinstallprompt event
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt')
      ;(event as any).prompt = () => Promise.resolve()
      ;(event as any).userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' })
      window.dispatchEvent(event)
    })
    
    await page.waitForTimeout(5500)
    
    // Press Escape key
    await page.keyboard.press('Escape')
    
    // Verify prompt is hidden
    const prompt = page.locator('text=Murata BJJをホーム画面に追加')
    await expect(prompt).not.toBeVisible()
  })

  test('should not show prompt again in same session after closing', async ({ page }) => {
    await page.goto('/')
    
    // Manually trigger beforeinstallprompt event
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt')
      ;(event as any).prompt = () => Promise.resolve()
      ;(event as any).userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' })
      window.dispatchEvent(event)
    })
    
    await page.waitForTimeout(5500)
    
    // Close the prompt
    await page.locator('button[aria-label="閉じる"]').first().click()
    
    // Navigate away and back
    await page.goto('/dashboard')
    await page.goto('/')
    
    // Try to trigger event again
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt')
      ;(event as any).prompt = () => Promise.resolve()
      ;(event as any).userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' })
      window.dispatchEvent(event)
    })
    
    // Wait to see if prompt appears again
    await page.waitForTimeout(5500)
    
    // Verify prompt is still hidden
    const prompt = page.locator('text=Murata BJJをホーム画面に追加')
    await expect(prompt).not.toBeVisible()
  })

  test('should show iOS specific instructions on iOS devices', async ({ page, browserName }) => {
    // Skip this test on non-webkit browsers
    test.skip(browserName !== 'webkit', 'iOS test only runs on WebKit')
    
    // Set iOS user agent
    await page.goto('/', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    })
    
    // Check for iOS specific instructions
    const iosPrompt = page.locator('text=Safari で共有ボタン')
    await expect(iosPrompt).toBeVisible()
    
    // Verify it has a close button
    const closeButton = page.locator('.fixed button[aria-label="閉じる"]')
    await expect(closeButton).toBeVisible()
  })

  test('should support multiple languages', async ({ page }) => {
    const languages = [
      { locale: 'en', title: 'Add Murata BJJ to Home Screen' },
      { locale: 'pt', title: 'Adicionar Murata BJJ à Tela Inicial' },
      { locale: 'es', title: 'Agregar Murata BJJ a Pantalla de Inicio' },
    ]

    for (const { locale, title } of languages) {
      // Change language
      await page.goto(`/${locale}`)
      
      // Manually trigger beforeinstallprompt event
      await page.evaluate(() => {
        const event = new Event('beforeinstallprompt')
        ;(event as any).prompt = () => Promise.resolve()
        ;(event as any).userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' })
        window.dispatchEvent(event)
      })
      
      await page.waitForTimeout(5500)
      
      // Check if correct language title is shown
      const prompt = page.locator(`text=${title}`)
      await expect(prompt).toBeVisible()
      
      // Close prompt for next iteration
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500) // Wait for animation
    }
  })

  test('should handle install flow correctly', async ({ page }) => {
    await page.goto('/')
    
    // Mock the install prompt behavior
    await page.addInitScript(() => {
      let installPromptEvent: any = null
      
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        installPromptEvent = e
        
        // Simulate user accepting the install
        installPromptEvent.prompt = async () => {
          installPromptEvent.userChoice = Promise.resolve({
            outcome: 'accepted',
            platform: 'web'
          })
        }
      })
      
      // Trigger the event after page load
      setTimeout(() => {
        const event = new Event('beforeinstallprompt')
        window.dispatchEvent(event)
      }, 1000)
    })
    
    await page.waitForTimeout(5500)
    
    // Click install button
    await page.locator('text=インストール').click()
    
    // Verify prompt is hidden after install
    const prompt = page.locator('text=Murata BJJをホーム画面に追加')
    await expect(prompt).not.toBeVisible()
  })

  test('should have proper ARIA labels and keyboard navigation', async ({ page }) => {
    await page.goto('/')
    
    // Manually trigger beforeinstallprompt event
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt')
      ;(event as any).prompt = () => Promise.resolve()
      ;(event as any).userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' })
      window.dispatchEvent(event)
    })
    
    await page.waitForTimeout(5500)
    
    // Check ARIA label on close button
    const closeButton = page.locator('button[aria-label="閉じる"]').first()
    await expect(closeButton).toBeVisible()
    
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // The close button should be focusable
    const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
    expect(focusedElement).toContain('閉じる')
  })

  test('should respect user preferences from localStorage', async ({ page }) => {
    // Set user as already installed
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('pwa-installed', 'true')
    })
    
    // Reload page
    await page.reload()
    await page.waitForTimeout(5500)
    
    // Verify prompt doesn't appear
    const prompt = page.locator('text=Murata BJJをホーム画面に追加')
    await expect(prompt).not.toBeVisible()
  })
})