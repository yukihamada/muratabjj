#!/usr/bin/env node

/**
 * Debug test for PWA Install Prompt
 */

const { chromium } = require('playwright')

async function debugPWAPrompt() {
  console.log('🤔 Debugging PWA Install Prompt...')
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true 
  })
  const page = await browser.newPage()
  
  // Enable console logs
  page.on('console', msg => {
    if (msg.type() === 'log') {
      console.log('📦 Browser console:', msg.text())
    }
  })
  
  // Enable error logs
  page.on('pageerror', err => {
    console.error('❌ Page error:', err.message)
  })
  
  try {
    console.log('\n1️⃣ Navigating to localhost:3000...')
    await page.goto('http://localhost:3000')
    await page.waitForTimeout(2000)
    
    console.log('\n2️⃣ Clearing storage...')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
      console.log('Storage cleared')
    })
    
    console.log('\n3️⃣ Checking PWAInstallPrompt component...')
    const componentExists = await page.evaluate(() => {
      const scripts = Array.from(document.scripts)
      const hasComponent = scripts.some(script => 
        script.textContent && script.textContent.includes('PWAInstallPrompt')
      )
      console.log('PWAInstallPrompt in page:', hasComponent)
      return hasComponent
    })
    
    console.log('\n4️⃣ Triggering beforeinstallprompt event...')
    await page.evaluate(() => {
      // Create a more complete mock event
      class MockBeforeInstallPromptEvent extends Event {
        constructor() {
          super('beforeinstallprompt', { cancelable: true })
          this.platforms = ['web']
          this.userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' })
        }
        
        prompt() {
          console.log('prompt() called')
          return Promise.resolve()
        }
        
        preventDefault() {
          console.log('preventDefault() called')
          super.preventDefault()
        }
      }
      
      const event = new MockBeforeInstallPromptEvent()
      console.log('Dispatching beforeinstallprompt event')
      const dispatched = window.dispatchEvent(event)
      console.log('Event dispatched:', dispatched)
    })
    
    console.log('\n5️⃣ Waiting 6 seconds for prompt...')
    await page.waitForTimeout(6000)
    
    console.log('\n6️⃣ Checking for prompt visibility...')
    const results = await page.evaluate(() => {
      const elements = {
        japanese: document.querySelector('[class*="fixed"][class*="inset"]'),
        byText: Array.from(document.querySelectorAll('*')).find(el => 
          el.textContent && el.textContent.includes('Murata BJJ')
        ),
        buttons: Array.from(document.querySelectorAll('button')),
        modals: Array.from(document.querySelectorAll('[class*="fixed"]')),
      }
      
      return {
        hasFixedElement: !!elements.japanese,
        hasTextElement: !!elements.byText,
        buttonCount: elements.buttons.length,
        modalCount: elements.modals.length,
        bodyHTML: document.body.innerHTML.substring(0, 500),
      }
    })
    
    console.log('\n📃 Results:')
    console.log(`- Fixed element found: ${results.hasFixedElement}`)
    console.log(`- Text element found: ${results.hasTextElement}`)
    console.log(`- Button count: ${results.buttonCount}`)
    console.log(`- Modal count: ${results.modalCount}`)
    console.log(`- Body HTML preview: ${results.bodyHTML}...`)
    
    // Keep browser open for manual inspection
    console.log('\n🔍 Browser will stay open for 30 seconds for manual inspection...')
    await page.waitForTimeout(30000)
    
  } catch (error) {
    console.error('\n❌ Test failed:', error)
  } finally {
    await browser.close()
  }
}

// Run debug if called directly
if (require.main === module) {
  debugPWAPrompt()
}