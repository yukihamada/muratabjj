import { AuthProvider } from '@/hooks/useAuth'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { Toaster } from 'react-hot-toast'

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  return (
    <>
      <LanguageProvider initialLocale={locale as 'ja' | 'en' | 'pt'}>
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
        </AuthProvider>
      </LanguageProvider>
    </>
  )
}