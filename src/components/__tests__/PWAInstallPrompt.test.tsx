import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PWAInstallPrompt from '../PWAInstallPrompt'
import { LanguageProvider } from '@/contexts/LanguageContext'

// Mock the useLanguage hook
jest.mock('@/contexts/LanguageContext', () => ({
  ...jest.requireActual('@/contexts/LanguageContext'),
  useLanguage: () => ({
    language: 'ja',
    locale: 'ja',
    setLocale: jest.fn(),
    t: {
      close: '閉じる',
    },
  }),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock navigator
Object.defineProperty(navigator, 'userAgent', {
  writable: true,
  value: 'Mozilla/5.0',
})

// Mock BeforeInstallPromptEvent
class MockBeforeInstallPromptEvent extends Event {
  readonly platforms: string[] = ['web']
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  
  constructor() {
    super('beforeinstallprompt')
    this.userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' })
  }
  
  prompt = jest.fn()
  preventDefault = jest.fn()
}

describe('PWAInstallPrompt', () => {
  beforeEach(() => {
    // Clear all storage
    localStorage.clear()
    sessionStorage.clear()
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should not render when already installed', () => {
    localStorage.setItem('pwa-installed', 'true')
    render(
      <LanguageProvider initialLocale="ja">
        <PWAInstallPrompt />
      </LanguageProvider>
    )
    
    expect(screen.queryByText('Murata BJJをホーム画面に追加')).not.toBeInTheDocument()
  })

  it('should show install prompt after beforeinstallprompt event', async () => {
    render(
      <LanguageProvider initialLocale="ja">
        <PWAInstallPrompt />
      </LanguageProvider>
    )
    
    // Trigger beforeinstallprompt event
    const event = new MockBeforeInstallPromptEvent()
    window.dispatchEvent(event)
    
    // Fast-forward 5 seconds
    jest.advanceTimersByTime(5000)
    
    await waitFor(() => {
      expect(screen.getByText('Murata BJJをホーム画面に追加')).toBeInTheDocument()
    })
  })

  describe('Closing the prompt', () => {
    beforeEach(async () => {
      render(
        <LanguageProvider initialLocale="ja">
          <PWAInstallPrompt />
        </LanguageProvider>
      )
      
      // Trigger and show prompt
      const event = new MockBeforeInstallPromptEvent()
      window.dispatchEvent(event)
      jest.advanceTimersByTime(5000)
      
      await waitFor(() => {
        expect(screen.getByText('Murata BJJをホーム画面に追加')).toBeInTheDocument()
      })
    })

    it('should close when clicking X button', async () => {
      const closeButton = screen.getByLabelText('閉じる')
      fireEvent.click(closeButton)
      
      await waitFor(() => {
        expect(screen.queryByText('Murata BJJをホーム画面に追加')).not.toBeInTheDocument()
      })
      
      expect(sessionStorage.getItem('pwa-install-closed-this-session')).toBe('true')
    })

    it('should close when clicking outside modal', async () => {
      const backdrop = screen.getByText('Murata BJJをホーム画面に追加').closest('.fixed.inset-0')
      fireEvent.click(backdrop!)
      
      await waitFor(() => {
        expect(screen.queryByText('Murata BJJをホーム画面に追加')).not.toBeInTheDocument()
      })
      
      expect(sessionStorage.getItem('pwa-install-closed-this-session')).toBe('true')
    })

    it('should close when pressing Escape key', async () => {
      fireEvent.keyDown(document, { key: 'Escape' })
      
      await waitFor(() => {
        expect(screen.queryByText('Murata BJJをホーム画面に追加')).not.toBeInTheDocument()
      })
      
      expect(sessionStorage.getItem('pwa-install-closed-this-session')).toBe('true')
    })

    it('should close when clicking 後で button', async () => {
      const laterButton = screen.getByText('後で')
      fireEvent.click(laterButton)
      
      await waitFor(() => {
        expect(screen.queryByText('Murata BJJをホーム画面に追加')).not.toBeInTheDocument()
      })
    })
  })

  it('should not show again in the same session after closing', async () => {
    const { rerender } = render(
      <LanguageProvider initialLocale="ja">
        <PWAInstallPrompt />
      </LanguageProvider>
    )
    
    // First prompt
    const event1 = new MockBeforeInstallPromptEvent()
    window.dispatchEvent(event1)
    jest.advanceTimersByTime(5000)
    
    await waitFor(() => {
      expect(screen.getByText('Murata BJJをホーム画面に追加')).toBeInTheDocument()
    })
    
    // Close it
    const closeButton = screen.getByLabelText('閉じる')
    fireEvent.click(closeButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Murata BJJをホーム画面に追加')).not.toBeInTheDocument()
    })
    
    // Trigger another event - should not show
    const event2 = new MockBeforeInstallPromptEvent()
    window.dispatchEvent(event2)
    jest.advanceTimersByTime(5000)
    
    expect(screen.queryByText('Murata BJJをホーム画面に追加')).not.toBeInTheDocument()
  })

  describe('iOS specific behavior', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      })
    })

    it('should show iOS specific instructions', () => {
      render(
        <LanguageProvider initialLocale="ja">
          <PWAInstallPrompt />
        </LanguageProvider>
      )
      
      expect(screen.getByText(/Safari で共有ボタン/)).toBeInTheDocument()
    })

    it('should have close button for iOS prompt', async () => {
      render(
        <LanguageProvider initialLocale="ja">
          <PWAInstallPrompt />
        </LanguageProvider>
      )
      
      const closeButton = screen.getByLabelText('閉じる')
      fireEvent.click(closeButton)
      
      await waitFor(() => {
        expect(screen.queryByText(/Safari で共有ボタン/)).not.toBeInTheDocument()
      })
    })
  })

  describe('Multi-language support', () => {
    const languages = [
      { code: 'en', title: 'Add Murata BJJ to Home Screen' },
      { code: 'pt', title: 'Adicionar Murata BJJ à Tela Inicial' },
      { code: 'es', title: 'Agregar Murata BJJ a Pantalla de Inicio' },
      { code: 'fr', title: "Ajouter Murata BJJ à l'écran d'accueil" },
      { code: 'ko', title: 'Murata BJJ를 홈 화면에 추가' },
      { code: 'ru', title: 'Добавить Murata BJJ на главный экран' },
      { code: 'zh', title: '将 Murata BJJ 添加到主屏幕' },
      { code: 'de', title: 'Murata BJJ zum Startbildschirm hinzufügen' },
      { code: 'it', title: 'Aggiungi Murata BJJ alla schermata Home' },
    ]

    languages.forEach(({ code, title }) => {
      it(`should display correct text in ${code}`, async () => {
        // Mock language context for each language
        jest.doMock('@/contexts/LanguageContext', () => ({
          useLanguage: () => ({ language: code }),
        }))
        
        render(
          <LanguageProvider initialLocale={code as any}>
            <PWAInstallPrompt />
          </LanguageProvider>
        )
        
        const event = new MockBeforeInstallPromptEvent()
        window.dispatchEvent(event)
        jest.advanceTimersByTime(5000)
        
        await waitFor(() => {
          expect(screen.getByText(title)).toBeInTheDocument()
        })
      })
    })
  })
})