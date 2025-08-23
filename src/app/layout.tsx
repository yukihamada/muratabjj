import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/hooks/useAuth'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Toaster } from 'react-hot-toast'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import MobileBottomNav from '@/components/MobileBottomNav'
import AppInitializer from '@/components/AppInitializer'
import ErrorBoundary from '@/components/ErrorBoundary'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Murata BJJ | フローと動画で強くなる柔術学習プラットフォーム',
  description: 'ブラジリアン柔術を連携（Flow）中心で学ぶWebプラットフォーム。動画カタログ、フローエディタ、習得度トラッキング、アダプティブ復習システムを提供。監修：村田良蔵（SJJIF世界選手権マスター2黒帯フェザー級2018・2019連覇）',
  keywords: ['BJJ', '柔術', 'ブラジリアン柔術', '村田良蔵', 'フロー学習', '動画学習', 'Brazilian Jiu-Jitsu', 'オンライン学習', '格闘技', 'マーシャルアーツ'],
  authors: [{ name: '村田良蔵', url: 'https://muratabjj.com' }],
  creator: 'Murata BJJ',
  publisher: 'Murata BJJ',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://muratabjjv2.vercel.app'),
  alternates: {
    canonical: '/',
    languages: {
      'ja': '/ja',
      'en': '/en',
      'pt': '/pt',
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Murata BJJ',
    startupImage: [
      {
        url: '/apple-touch-icon.png',
        media: '(device-width: 768px) and (device-height: 1024px)',
      },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'pt_BR'],
    url: 'https://muratabjj.com',
    siteName: 'Murata BJJ',
    title: 'Murata BJJ | フローと動画で強くなる柔術学習プラットフォーム',
    description: 'ブラジリアン柔術を連携（Flow）中心で学ぶWebプラットフォーム。監修：村田良蔵（SJJIF世界選手権2連覇）',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Murata BJJ - フローと動画で強くなる柔術学習プラットフォーム',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Murata BJJ | フローと動画で強くなる',
    description: 'ブラジリアン柔術を連携（Flow）中心で学ぶWebプラットフォーム',
    images: ['/og-image.png'],
    creator: '@muratabjj',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-site-verification-code',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#1e40af',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Murata BJJ" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#ea384c" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // ダークモードを即座に適用して白いフラッシュを防ぐ
              (function() {
                const savedTheme = localStorage.getItem('theme');
                const theme = savedTheme || 'dark';
                document.documentElement.classList.add(theme);
                document.documentElement.style.backgroundColor = '#0f0f12';
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <AppInitializer>
            <ThemeProvider>
              <LanguageProvider initialLocale="ja">
                <AuthProvider>
                {children}
                <MobileBottomNav />
                <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#13131a',
                color: '#e9e9ee',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
              },
              success: {
                iconTheme: {
                  primary: '#ea384c',
                  secondary: '#fff',
                },
              },
            }}
          />
          <PWAInstallPrompt />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', async () => {
                    try {
                      // First unregister old service workers
                      const registrations = await navigator.serviceWorker.getRegistrations();
                      for (const registration of registrations) {
                        if (registration.active && registration.active.scriptURL.includes('/sw.js')) {
                          await registration.unregister();
                          console.log('Old SW unregistered');
                        }
                      }
                      
                      // Then register new simple service worker
                      const registration = await navigator.serviceWorker.register('/sw-simple.js');
                      console.log('New SW registered: ', registration);
                    } catch (error) {
                      console.error('SW error:', error);
                    }
                  });
                }
              `,
            }}
          />
                </AuthProvider>
              </LanguageProvider>
            </ThemeProvider>
          </AppInitializer>
        </ErrorBoundary>
      </body>
    </html>
  )
}