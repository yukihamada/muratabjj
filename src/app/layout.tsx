import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/hooks/useAuth'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { Toaster } from 'react-hot-toast'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Murata BJJ | フローと動画で強くなる',
  description: '連携（Flow）×動画×習得度で学ぶ柔術プラットフォーム。多言語対応。監修：村田 良蔵。',
  keywords: ['BJJ', '柔術', 'ブラジリアン柔術', '村田良蔵', 'フロー学習', '動画学習'],
  manifest: '/manifest.json',
  themeColor: '#ea384c',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Murata BJJ'
  },
  openGraph: {
    title: 'Murata BJJ',
    description: 'Flow × Video × Progress',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512x512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Murata BJJ" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#ea384c" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={inter.className}>
        <LanguageProvider initialLocale="ja">
          <AuthProvider>
            {children}
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
                  window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js')
                      .then(registration => {
                        console.log('SW registered: ', registration);
                      })
                      .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                      });
                  });
                }
              `,
            }}
          />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}