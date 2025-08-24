'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Download, X, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

const translations = {
  ja: {
    installApp: 'アプリをインストール',
    installTitle: 'Murata BJJをホーム画面に追加',
    installDescription: 'より快適にご利用いただくため、アプリをインストールしませんか？',
    features: [
      'オフラインでの動画視聴',
      'プッシュ通知で復習リマインド',
      'ホーム画面から素早くアクセス',
      'ネイティブアプリのような体験'
    ],
    install: 'インストール',
    later: '後で',
    close: '閉じる'
  },
  en: {
    installApp: 'Install App',
    installTitle: 'Add Murata BJJ to Home Screen',
    installDescription: 'Install our app for a better experience?',
    features: [
      'Offline video viewing',
      'Push notifications for review reminders', 
      'Quick access from home screen',
      'Native app-like experience'
    ],
    install: 'Install',
    later: 'Later',
    close: 'Close'
  },
  pt: {
    installApp: 'Instalar App',
    installTitle: 'Adicionar Murata BJJ à Tela Inicial',
    installDescription: 'Instale nosso app para uma melhor experiência?',
    features: [
      'Visualização de vídeos offline',
      'Notificações push para lembretes de revisão',
      'Acesso rápido da tela inicial',
      'Experiência como app nativo'
    ],
    install: 'Instalar',
    later: 'Depois',
    close: 'Fechar'
  },
  es: {
    installApp: 'Instalar App',
    installTitle: 'Agregar Murata BJJ a Pantalla de Inicio',
    installDescription: '¿Instalar nuestra app para una mejor experiencia?',
    features: [
      'Visualización de videos offline',
      'Notificaciones push para recordatorios de repaso',
      'Acceso rápido desde la pantalla de inicio',
      'Experiencia como app nativa'
    ],
    install: 'Instalar',
    later: 'Después',
    close: 'Cerrar'
  },
  fr: {
    installApp: 'Installer l\'App',
    installTitle: 'Ajouter Murata BJJ à l\'écran d\'accueil',
    installDescription: 'Installer notre app pour une meilleure expérience?',
    features: [
      'Visionnage de vidéos hors ligne',
      'Notifications push pour rappels de révision',
      'Accès rapide depuis l\'écran d\'accueil',
      'Expérience comme une app native'
    ],
    install: 'Installer',
    later: 'Plus tard',
    close: 'Fermer'
  },
  ko: {
    installApp: '앱 설치',
    installTitle: 'Murata BJJ를 홈 화면에 추가',
    installDescription: '더 나은 경험을 위해 앱을 설치하시겠습니까?',
    features: [
      '오프라인 동영상 시청',
      '복습 알림을 위한 푸시 알림',
      '홈 화면에서 빠른 접근',
      '네이티브 앱과 같은 경험'
    ],
    install: '설치',
    later: '나중에',
    close: '닫기'
  },
  ru: {
    installApp: 'Установить приложение',
    installTitle: 'Добавить Murata BJJ на главный экран',
    installDescription: 'Установить наше приложение для лучшего опыта?',
    features: [
      'Просмотр видео офлайн',
      'Push-уведомления для напоминаний о повторении',
      'Быстрый доступ с главного экрана',
      'Опыт как у нативного приложения'
    ],
    install: 'Установить',
    later: 'Позже',
    close: 'Закрыть'
  },
  zh: {
    installApp: '安装应用',
    installTitle: '将 Murata BJJ 添加到主屏幕',
    installDescription: '安装我们的应用以获得更好的体验？',
    features: [
      '离线视频观看',
      '复习提醒的推送通知',
      '从主屏幕快速访问',
      '原生应用般的体验'
    ],
    install: '安装',
    later: '稍后',
    close: '关闭'
  },
  de: {
    installApp: 'App installieren',
    installTitle: 'Murata BJJ zum Startbildschirm hinzufügen',
    installDescription: 'Unsere App für eine bessere Erfahrung installieren?',
    features: [
      'Offline-Video-Betrachtung',
      'Push-Benachrichtigungen für Wiederholungserinnerungen',
      'Schneller Zugriff vom Startbildschirm',
      'Native App-ähnliche Erfahrung'
    ],
    install: 'Installieren',
    later: 'Später',
    close: 'Schließen'
  },
  it: {
    installApp: 'Installa App',
    installTitle: 'Aggiungi Murata BJJ alla schermata Home',
    installDescription: 'Installare la nostra app per una migliore esperienza?',
    features: [
      'Visualizzazione video offline',
      'Notifiche push per promemoria di ripasso',
      'Accesso rapido dalla schermata home',
      'Esperienza simile ad app nativa'
    ],
    install: 'Installa',
    later: 'Dopo',
    close: 'Chiudi'
  }
}

export default function PWAInstallPrompt() {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations] || translations.en
  
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if running as PWA
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                           (window.navigator as any).standalone === true ||
                           document.referrer.includes('android-app://')
    
    setIsStandalone(isStandaloneMode)

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Check if user has dismissed prompt before
      const dismissed = typeof window !== 'undefined' ? localStorage.getItem('pwa-install-dismissed') : null
      const lastPrompt = typeof window !== 'undefined' ? localStorage.getItem('pwa-install-last-prompt') : null
      const now = new Date().getTime()
      const oneDayMs = 24 * 60 * 60 * 1000
      
      // Check if closed in this session
      const closedThisSession = sessionStorage.getItem('pwa-install-closed-this-session')
      
      if (!dismissed && !closedThisSession && (!lastPrompt || now - parseInt(lastPrompt) > oneDayMs * 7)) {
        // Show prompt after a delay
        setTimeout(() => {
          setShowPrompt(true)
        }, 5000) // 5 seconds delay
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Handle app installed
    const handleAppInstalled = () => {
      setShowPrompt(false)
      setDeferredPrompt(null)
      localStorage.setItem('pwa-installed', 'true')
    }

    window.addEventListener('appinstalled', handleAppInstalled)
    
    // Handle ESC key to close prompt
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPrompt) {
        setShowPrompt(false)
        sessionStorage.setItem('pwa-install-closed-this-session', 'true')
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true')
      } else {
        localStorage.setItem('pwa-install-dismissed', 'true')
        localStorage.setItem('pwa-install-last-prompt', new Date().getTime().toString())
      }
      
      setShowPrompt(false)
      setDeferredPrompt(null)
    } catch (error) {
      console.error('PWA install error:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-last-prompt', new Date().getTime().toString())
  }

  const handleClose = () => {
    setShowPrompt(false)
    // Set a temporary dismiss flag to prevent showing again in this session
    sessionStorage.setItem('pwa-install-closed-this-session', 'true')
    localStorage.setItem('pwa-install-last-prompt', new Date().getTime().toString())
  }

  // Don't show if already installed or running as PWA
  if (isStandalone || (typeof window !== 'undefined' && localStorage.getItem('pwa-installed'))) {
    return null
  }

  // iOS Install Instructions
  if (isIOS && !isStandalone) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-bjj-bg2 border border-bjj-accent/30 rounded-bjj p-4 shadow-lg z-50">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-bjj-accent" />
            <h3 className="font-semibold text-sm">{t.installTitle}</h3>
          </div>
          <button
            onClick={() => {
              setShowPrompt(false)
              sessionStorage.setItem('pwa-install-closed-this-session', 'true')
            }}
            className="p-2 -m-2 text-bjj-muted hover:text-bjj-text transition-colors"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-xs text-bjj-muted mb-3">
          {language === 'ja' 
            ? 'Safari で共有ボタン → "ホーム画面に追加" をタップしてください'
            : language === 'en'
            ? 'Tap the share button in Safari → "Add to Home Screen"'
            : 'Toque no botão compartilhar no Safari → "Adicionar à Tela Inicial"'
          }
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowPrompt(false)
              sessionStorage.setItem('pwa-install-closed-this-session', 'true')
            }}
            className="flex-1 text-xs py-2 px-3 bg-white/10 rounded-lg text-bjj-muted hover:bg-white/20 transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    )
  }

  // Android/Desktop Install Prompt
  if (showPrompt && deferredPrompt) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowPrompt(false)
            sessionStorage.setItem('pwa-install-closed-this-session', 'true')
          }
        }}
      >
        <div className="bg-bjj-bg2 border border-white/10 rounded-bjj p-6 max-w-md w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-bjj-accent to-red-600 rounded-xl flex items-center justify-center">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{t.installTitle}</h3>
              </div>
            </div>
            <button
              onClick={() => {
                setShowPrompt(false)
                sessionStorage.setItem('pwa-install-closed-this-session', 'true')
              }}
              className="p-2 -m-2 text-bjj-muted hover:text-bjj-text transition-colors"
              aria-label={t.close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-bjj-muted mb-4">{t.installDescription}</p>
          
          <ul className="space-y-2 mb-6">
            {t.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3 text-sm">
                <div className="w-1.5 h-1.5 bg-bjj-accent rounded-full"></div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          <div className="flex gap-3">
            <button
              onClick={handleInstall}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {t.install}
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 btn-ghost"
            >
              {t.later}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}