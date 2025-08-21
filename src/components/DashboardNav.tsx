'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import { Home, Video, Target, Swords, Brain, PenTool, User, LogOut, Menu, X, Shield } from 'lucide-react'
import { useState } from 'react'

const translations = {
  ja: {
    dashboard: 'ダッシュボード',
    videos: '動画',
    progress: '習得度',
    sparring: 'スパーリング',
    review: '復習',
    flows: 'フロー',
    admin: '管理者',
    profile: 'プロフィール',
    logout: 'ログアウト',
  },
  en: {
    dashboard: 'Dashboard',
    videos: 'Videos',
    progress: 'Progress',
    sparring: 'Sparring',
    review: 'Review',
    flows: 'Flows',
    admin: 'Admin',
    profile: 'Profile',
    logout: 'Logout',
  },
  pt: {
    dashboard: 'Painel',
    videos: 'Vídeos',
    progress: 'Progresso',
    sparring: 'Sparring',
    review: 'Revisão',
    flows: 'Fluxos',
    admin: 'Admin',
    profile: 'Perfil',
    logout: 'Sair',
  },
}

export default function DashboardNav() {
  const pathname = usePathname()
  const { user, signOut, isAdmin } = useAuth()
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations]
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { href: '/dashboard', label: t.dashboard, icon: Home },
    { href: '/dashboard/videos', label: t.videos, icon: Video },
    { href: '/dashboard/progress', label: t.progress, icon: Target },
    { href: '/dashboard/sparring', label: t.sparring, icon: Swords },
    { href: '/dashboard/review', label: t.review, icon: Brain },
    { href: '/flows', label: t.flows, icon: PenTool },
    ...(isAdmin ? [{ href: '/admin', label: t.admin, icon: Shield }] : []),
  ]

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 font-bold">
            <svg width="24" height="24" viewBox="0 0 64 64" aria-hidden="true">
              <defs>
                <linearGradient id="nav-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#ea384c"/>
                  <stop offset="1" stopColor="#d21f33"/>
                </linearGradient>
              </defs>
              <circle cx="32" cy="32" r="30" fill="url(#nav-gradient)" opacity=".12"/>
              <path d="M12 40c6-12 11-18 20-18s14 6 20 18" fill="none" stroke="url(#nav-gradient)" strokeWidth="4" strokeLinecap="round"/>
              <circle cx="32" cy="32" r="4" fill="#ea384c"/>
            </svg>
            <span className="hidden sm:inline">Murata BJJ</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 lg:gap-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'text-bjj-accent bg-bjj-accent/10'
                      : 'text-bjj-muted hover:text-bjj-text hover:bg-white/5'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium hidden lg:inline">{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-bjj-accent rounded-full"></span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            {user && (
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard/profile"
                  className={`hidden md:flex items-center gap-2 text-bjj-muted hover:text-bjj-text transition-all`}
                  title={user.email}
                >
                  <User className="w-5 h-5" />
                </Link>
                
                <button
                  onClick={signOut}
                  className="hidden md:flex items-center gap-2 text-bjj-muted hover:text-bjj-accent transition-all"
                  title={t.logout}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">{t.logout}</span>
                </button>

                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-3 -mr-3"
                  aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all min-h-[56px] ${
                    isActive
                      ? 'bg-bjj-accent/20 text-bjj-accent'
                      : 'hover:bg-white/5 text-bjj-text'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="font-medium text-base">{item.label}</span>
                </Link>
              )
            })}
            
            <div className="mt-4 pt-4 border-t border-white/10">
              <Link
                href="/dashboard/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-white/5 text-bjj-text transition-all min-h-[56px]"
              >
                <User className="w-6 h-6" />
                <span className="font-medium text-base">{t.profile}</span>
              </Link>
              
              <button
                onClick={() => {
                  signOut()
                  setIsMenuOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-white/5 text-bjj-text transition-all min-h-[56px]"
              >
                <LogOut className="w-6 h-6" />
                <span className="font-medium text-base">{t.logout}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}