import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/hooks/useAuth'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { Toaster } from 'react-hot-toast'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import MobileBottomNav from '@/components/MobileBottomNav'
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
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon.svg',
        color: '#1e40af',
      },
    ],
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