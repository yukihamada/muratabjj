'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'
import AuthDialog from './AuthDialog'
import LanguageSwitcher from './LanguageSwitcher'
import { User, LogOut, Menu, X } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authDialogMode, setAuthDialogMode] = useState<'login' | 'signup'>('login')
  const { user, signOut, loading } = useAuth()
  const { t } = useLanguage()
  
  // tが読み込まれていない場合の早期リターン
  if (!t || !t.nav) {
    return (
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 font-extrabold text-lg">
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="4" fill="#1e40af"/>
                <text x="16" y="20" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="white" textAnchor="middle">柔</text>
              </svg>
              <span className="text-gray-900">Murata BJJ</span>
            </div>
            <div className="animate-pulse bg-gray-200 h-10 w-24 rounded-lg"></div>
          </div>
        </nav>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-lg">
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="4" fill="#1e40af"/>
              <text x="16" y="20" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="white" textAnchor="middle">柔</text>
            </svg>
            <span className="text-gray-900">Murata BJJ</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            <Link href="#features" className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors">{t.nav.features}</Link>
            <Link href="#how" className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors">{t.nav.howToUse}</Link>
            <Link href="#pricing" className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors">{t.nav.pricing}</Link>
            <Link href="#supervisor" className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors">{t.nav.supervisor}</Link>
            <Link href="#faq" className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors">{t.nav.faq}</Link>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {loading ? (
              <div className="flex items-center gap-2 px-4 py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span className="text-gray-500 text-sm">{t.common?.loading || '読み込み中...'}</span>
              </div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">{user.email?.split('@')[0]}</span>
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">{t.nav.logout}</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthDialogMode('login')
                    setShowAuthDialog(true)
                  }}
                  className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                  data-testid="login-button"
                >
                  {t.nav.login}
                </button>
                <button
                  onClick={() => {
                    setAuthDialogMode('signup')
                    setShowAuthDialog(true)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t.nav.freeStart}
                </button>
              </>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              <Link href="#features" className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors" onClick={() => setIsMenuOpen(false)}>
                {t.nav.features}
              </Link>
              <Link href="#how" className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors" onClick={() => setIsMenuOpen(false)}>
                {t.nav.howToUse}
              </Link>
              <Link href="#pricing" className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors" onClick={() => setIsMenuOpen(false)}>
                {t.nav.pricing}
              </Link>
              <Link href="#supervisor" className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors" onClick={() => setIsMenuOpen(false)}>
                {t.nav.supervisor}
              </Link>
              <Link href="#faq" className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors" onClick={() => setIsMenuOpen(false)}>
                {t.nav.faq}
              </Link>
            </div>
          </div>
        )}
      </nav>
      
      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        initialMode={authDialogMode}
      />
    </header>
  )
}