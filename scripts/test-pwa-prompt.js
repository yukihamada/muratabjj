#!/usr/bin/env node

/**
 * Quick test for PWA Install Prompt functionality
 */

const { chromium } = require('playwright')

async function testPWAPrompt() {
  console.log('🧪 Testing PWA Install Prompt...')
  
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  
  try {
    // Test 1: Show prompt after 5 seconds
    console.log('\nTest 1: Show prompt after 5 seconds')
    await page.goto('http://localhost:3000')
    
    // Clear storage
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    
    // Trigger beforeinstallprompt event
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt')
      event.prompt = () => Promise.resolve()
      event.userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' })
      window.dispatchEvent(event)
    })
    
    await page.waitForTimeout(5500)
    
    const promptVisible = await page.locator('text=Murata BJJをホーム画面に追加').isVisible()
    console.log(`✅ Prompt visible: ${promptVisible}`)
    
    // Test 2: Close with X button
    console.log('\nTest 2: Close with X button')
    if (promptVisible) {
      await page.locator('button[aria-label="閉じる"]').first().click()
      await page.waitForTimeout(500)
      
      const promptHidden = !(await page.locator('text=Murata BJJをホーム画面に追加').isVisible())
      console.log(`✅ Prompt hidden after X click: ${promptHidden}`)
      
      const sessionValue = await page.evaluate(() => 
        sessionStorage.getItem('pwa-install-closed-this-session')
      )
      console.log(`✅ Session storage set: ${sessionValue === 'true'}`)
    }
    
    // Test 3: Verify doesn't show again in session
    console.log('\nTest 3: Verify doesn\'t show again in session')
    await page.reload()
    
    // Trigger event again
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt')
      event.prompt = () => Promise.resolve()
      event.userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' })
      window.dispatchEvent(event)
    })
    
    await page.waitForTimeout(5500)
    
    const promptStillHidden = !(await page.locator('text=Murata BJJをホーム画面に追加').isVisible())
    console.log(`✅ Prompt still hidden: ${promptStillHidden}`)
    
    // Test 4: Test Escape key
    console.log('\nTest 4: Test Escape key')
    // Clear session storage
    await page.evaluate(() => {
      sessionStorage.clear()
    })
    await page.reload()
    
    // Trigger event
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt')
      event.prompt = () => Promise.resolve()
      event.userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' })
      window.dispatchEvent(event)
    })
    
    await page.waitForTimeout(5500)
    
    if (await page.locator('text=Murata BJJをホーム画面に追加').isVisible()) {
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
      
      const hiddenByEscape = !(await page.locator('text=Murata BJJをホーム画面に追加').isVisible())
      console.log(`✅ Hidden by Escape key: ${hiddenByEscape}`)
    }
    
    console.log('\n✅ All tests completed!')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error)
  } finally {
    await browser.close()
  }
}

// Run tests if called directly
if (require.main === module) {
  testPWAPrompt()
}