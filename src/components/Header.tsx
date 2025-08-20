'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'
import AuthDialog from './AuthDialog'
import LanguageSwitcher from './LanguageSwitcher'
import { User, LogOut } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const { user, signOut, loading } = useAuth()
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-lg">
            <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden="true">
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#ea384c"/>
                  <stop offset="1" stopColor="#d21f33"/>
                </linearGradient>
              </defs>
              <circle cx="32" cy="32" r="30" fill="url(#g)" opacity=".12"/>
              <path d="M12 40c6-12 11-18 20-18s14 6 20 18" fill="none" stroke="url(#g)" strokeWidth="4" strokeLinecap="round"/>
              <circle cx="32" cy="32" r="4" fill="#ea384c"/>
            </svg>
            Murata BJJ
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="hover:text-bjj-accent transition-colors">{t.nav.features}</Link>
            <Link href="#how" className="hover:text-bjj-accent transition-colors">{t.nav.howToUse}</Link>
            <Link href="#pricing" className="hover:text-bjj-accent transition-colors">{t.nav.pricing}</Link>
            <Link href="#supervisor" className="hover:text-bjj-accent transition-colors">{t.nav.supervisor}</Link>
            <Link href="#faq" className="hover:text-bjj-accent transition-colors">{t.nav.faq}</Link>
          </div>
          
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {loading ? (
              <div className="px-5 py-3">{t.common.loading}</div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="flex items-center gap-2 text-sm">
                  <User size={18} />
                  <span className="hidden sm:inline">{user.email}</span>
                </Link>
                <button
                  onClick={signOut}
                  className="btn-ghost flex items-center gap-2"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">{t.nav.logout}</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowAuthDialog(true)}
                  className="hover:text-bjj-accent transition-colors"
                >
                  {t.nav.login}
                </button>
                <button
                  onClick={() => setShowAuthDialog(true)}
                  className="btn-primary"
                >
                  {t.nav.freeStart}
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
      
      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
      />
    </header>
  )
}